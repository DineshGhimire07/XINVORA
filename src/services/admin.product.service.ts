import "server-only"
import { db } from "@/db/client"
import { insertProduct, updateProduct, softDeleteProduct, restoreProduct } from "@/db/mutations/products"
import { AdminAuditService } from "./admin.audit.service"
import { findProductBySlug } from "@/db/queries/products"
import {
  products,
  variants,
  productImages,
  variantImages,
  productCollections,
  productMaterials,
  productTags,
  productPairings,
  inventory,
  priceBooks,
  priceBookEntries,
  cartItems,
  wishlistItems,
  productOffSection,
} from "@/db/schema"
import { eq, ne, and, inArray, sql, or, asc } from "drizzle-orm"
import { ProductImageMetadataService } from "@/domains/seo/services/product-image-metadata.service"

export interface CreateProductInput {
  name: string
  slug: string
  description?: string | null
  badge?: string | null
  details?: string | null
  careGuide?: string | null
  sizeGuide?: string | null
  categoryId: string
  brandId?: string | null
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  basePrice: string | number
  compareAtPrice?: string | number | null
  stockQuantity?: string | number
  images?: string[]
  collectionIds?: string[]
  materialIds?: string[]
  pairedProductIds?: string[]
  seoTitle?: string | null
  seoDescription?: string | null
  instagramReelUrl?: string | null
  virtualTryonPrompt?: string | null
  shortDescription?: string | null
  sizeStocks?: Record<string, number>
  imageRoles?: Record<string, string>
}

export type UpdateProductInput = Partial<CreateProductInput>

export class AdminProductService {
  static async createProduct(data: CreateProductInput, adminUserId: string) {
    return await db.transaction(async (tx) => {
      // Validate slug uniqueness
      const existing = await findProductBySlug(data.slug)
      if (existing) {
        throw new Error("Slug already in use.")
      }

      const { basePrice, compareAtPrice, stockQuantity, images, imageRoles, collectionIds, materialIds, pairedProductIds, sizeStocks, ...productData } = data
      const finalShortDesc = productData.shortDescription || (productData.description ? productData.description.slice(0, 200) : "Concise summary of this product details.")
      const product = await insertProduct({
        ...productData,
        shortDescription: finalShortDesc
      }, tx)

      // Handle collections
      if (collectionIds && collectionIds.length > 0) {
        await tx.insert(productCollections).values(
          collectionIds.map((cId: string) => ({
            productId: product.id,
            collectionId: cId,
          }))
        )
      }

      // Handle images with deterministic template resolution & metadata generation
      if (images && images.length > 0) {
        const template = await ProductImageMetadataService.resolveProductImageTemplate(
          product,
          collectionIds,
          tx
        )
        const generated = ProductImageMetadataService.generateMetadataForProduct({
          productName: product.name,
          productSlug: product.slug,
          images: images.map((url: string, index: number) => {
            const explicitRole = imageRoles?.[url] || imageRoles?.[String(index)] || null
            return {
              url,
              position: index + 1,
              role: explicitRole && explicitRole !== "auto" ? explicitRole : undefined,
              altTextSource: "auto",
            }
          }),
          template,
        })
        await tx.insert(productImages).values(
          generated.map((img) => ({
            productId: product.id,
            url: img.url,
            position: img.position,
            altText: img.altText,
            altTextSource: img.altTextSource,
            imageRole: img.imageRole,
          }))
        )
      }

      // Add to default price book
      const defaultPriceBook = await tx.select().from(priceBooks).where(eq(priceBooks.isDefault, true)).limit(1)
      const priceBookId = defaultPriceBook[0]?.id
      if (!priceBookId) {
        throw new Error("Default price book not found.")
      }

      // Handle materials
      if (materialIds && materialIds.length > 0) {
        await tx.insert(productMaterials).values(
          materialIds.map((mId: string) => ({
            productId: product.id,
            materialId: mId,
          }))
        )
      }

      // Handle pairings
      if (pairedProductIds && pairedProductIds.length > 0) {
        await tx.insert(productPairings).values(
          pairedProductIds.map((pId: string, index: number) => ({
            productId: product.id,
            pairedProductId: pId,
            sortOrder: index,
          }))
        )
      }

      // Handle variants (Batched for instant speed)
      const activeSizes = Object.keys(sizeStocks || {}).filter(sizeId => (sizeStocks || {})[sizeId] > 0)
      
      if (activeSizes.length > 0) {
        const newVariants = await tx.insert(variants).values(
          activeSizes.map(sizeId => ({
            productId: product.id,
            sku: `${product.slug}-${sizeId.slice(0, 4)}`.toUpperCase(),
            sizeId,
          }))
        ).returning()

        // Batch insert price book entries and inventory
        await tx.insert(priceBookEntries).values(
          newVariants.map(variant => ({
            priceBookId,
            variantId: variant.id,
            price: Math.round(Number(basePrice) * 100),
            compareAtPrice: compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null,
          }))
        )

        await tx.insert(inventory).values(
          newVariants.map(variant => ({
            variantId: variant.id,
            quantity: (sizeStocks || {})[variant.sizeId!] || 0,
            lowStockThreshold: 2,
          }))
        )
      } else {
        // Fallback: create default non-sized variant
        const [defaultVariant] = await tx.insert(variants).values({
          productId: product.id,
          sku: `${product.slug}-DEFAULT`.toUpperCase(),
        }).returning()

        await tx.insert(priceBookEntries).values({
          priceBookId,
          variantId: defaultVariant.id,
          price: Math.round(Number(basePrice) * 100),
          compareAtPrice: compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null,
        })

        await tx.insert(inventory).values({
          variantId: defaultVariant.id,
          quantity: Number(stockQuantity) || 0,
          lowStockThreshold: 2,
        })
      }

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "PRODUCT",
        entityId: product.id,
        newValue: product,
      }, tx)

      return product
    })
  }

  static async updateProduct(id: string, data: UpdateProductInput, adminUserId: string) {
    return await db.transaction(async (tx) => {
      // Validate slug uniqueness if changed
      if (data.slug) {
        const existing = await findProductBySlug(data.slug)
        if (existing && existing.id !== id) {
          throw new Error("Slug already in use by another product.")
        }
      }

      const { basePrice, compareAtPrice, stockQuantity, images, imageRoles, collectionIds, materialIds, pairedProductIds, sizeStocks, ...productData } = data
      const product = await updateProduct(id, productData, tx)

      // Update collections first so template resolution has current collection associations
      await tx.delete(productCollections).where(eq(productCollections.productId, id))
      if (collectionIds && collectionIds.length > 0) {
        await tx.insert(productCollections).values(
          collectionIds.map((cId: string) => ({
            productId: id,
            collectionId: cId,
          }))
        )
      }

      // Query existing image records to preserve any manual alt text (altTextSource = 'manual')
      const existingImages = await tx.query.productImages.findMany({
        where: eq(productImages.productId, id),
        orderBy: [asc(productImages.position)],
      })
      const manualAltMap = new Map<string, string>()
      existingImages.forEach((img: any) => {
        if (img.altTextSource === "manual" && img.altText) {
          manualAltMap.set(img.url, img.altText)
        }
      })

      // Update images
      await tx.delete(productImages).where(eq(productImages.productId, id))
      if (images && images.length > 0) {
        const template = await ProductImageMetadataService.resolveProductImageTemplate(
          product,
          collectionIds,
          tx
        )
        const generated = ProductImageMetadataService.generateMetadataForProduct({
          productName: product.name,
          productSlug: product.slug,
          images: images.map((url: string, index: number) => {
            const explicitRole = imageRoles?.[url] || imageRoles?.[String(index)] || null
            const manualAlt = manualAltMap.get(url)
            return {
              url,
              position: index + 1,
              role: explicitRole && explicitRole !== "auto" ? explicitRole : undefined,
              altText: manualAlt || null,
              altTextSource: manualAlt ? "manual" : "auto",
            }
          }),
          template,
        })
        await tx.insert(productImages).values(
          generated.map((img) => ({
            productId: id,
            url: img.url,
            position: img.position,
            altText: img.altText,
            altTextSource: img.altTextSource,
            imageRole: img.imageRole,
          }))
        )
      }

      // Update materials
      await tx.delete(productMaterials).where(eq(productMaterials.productId, id))
      if (materialIds && materialIds.length > 0) {
        await tx.insert(productMaterials).values(
          materialIds.map((mId: string) => ({
            productId: id,
            materialId: mId,
          }))
        )
      }

      // Update pairings
      if (pairedProductIds !== undefined) {
        await tx.delete(productPairings).where(eq(productPairings.productId, id))
        if (pairedProductIds.length > 0) {
          await tx.insert(productPairings).values(
            pairedProductIds.map((pId: string, index: number) => ({
              productId: id,
              pairedProductId: pId,
              sortOrder: index,
            }))
          )
        }
      }

      // Update variants & inventory for sizes if sizeStocks is passed
      if (sizeStocks) {
        // Resolve Default Price Book
        let priceBook = await tx.select().from(priceBooks).where(eq(priceBooks.currency, "NPR")).limit(1)
        let priceBookId
        if (priceBook.length === 0) {
          const [newPb] = await tx.insert(priceBooks).values({
            name: "Default NPR",
            currency: "NPR",
            isDefault: true
          }).returning()
          priceBookId = newPb.id
        } else {
          priceBookId = priceBook[0].id
        }

        const existingVariants = await tx.select().from(variants).where(eq(variants.productId, id))
        const existingVariantIds = existingVariants.map(v => v.id)
        
        let existingInventories: any[] = []
        if (existingVariantIds.length > 0) {
          existingInventories = await tx.select().from(inventory).where(inArray(inventory.variantId, existingVariantIds))
        }

        const newVariantSizesToCreate: { sizeId: string; qty: number }[] = []

        for (const [sizeId, qty] of Object.entries(sizeStocks)) {
          const stockNum = Number(qty) || 0
          const match = existingVariants.find(v => v.sizeId === sizeId)

          if (match) {
            // Existing variant: update stock & price
            const invRow = existingInventories.find(i => i.variantId === match.id)
            if (invRow) {
              await tx.update(inventory)
                .set({
                  quantity: stockNum,
                  status: stockNum > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
                })
                .where(eq(inventory.variantId, match.id))
            } else {
              await tx.insert(inventory).values({
                variantId: match.id,
                quantity: stockNum,
                status: stockNum > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
              })
            }

            if (basePrice !== undefined) {
              await tx.update(priceBookEntries)
                .set({
                  price: Math.round(Number(basePrice) * 100),
                  compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null) : undefined,
                })
                .where(eq(priceBookEntries.variantId, match.id))
            }
          } else if (stockNum > 0) {
            // Collect new variant sizes to batch create
            newVariantSizesToCreate.push({ sizeId, qty: stockNum })
          }
        }

        // Batch create all new size variants in 3 queries
        if (newVariantSizesToCreate.length > 0) {
          const variantRows = newVariantSizesToCreate.map(item => ({
            productId: id,
            sku: `${product.slug}-${item.sizeId.slice(0, 4)}-${crypto.randomUUID().slice(0, 8)}`,
            sizeId: item.sizeId,
          }))

          const insertedVariants = await tx.insert(variants).values(variantRows).returning()

          const inventoryRows = insertedVariants.map(v => {
            const item = newVariantSizesToCreate.find(i => i.sizeId === v.sizeId)
            const quantity = item?.qty || 0
            return {
              variantId: v.id,
              quantity,
              status: (quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK") as "IN_STOCK" | "OUT_OF_STOCK"
            }
          })
          await tx.insert(inventory).values(inventoryRows)

          const priceRows = insertedVariants.map(v => ({
            priceBookId: priceBookId,
            variantId: v.id,
            price: Math.round(Number(basePrice) * 100),
            compareAtPrice: compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null,
          }))
          await tx.insert(priceBookEntries).values(priceRows)
        }
      } else {
        // Fallback to update base variant inventory
        const [variant] = await tx.select().from(variants).where(eq(variants.productId, id)).limit(1)
        if (variant && stockQuantity !== undefined) {
          const stockNum = Number(stockQuantity) || 0
          
          const existingInventory = await tx.select().from(inventory).where(eq(inventory.variantId, variant.id)).limit(1)
          if (existingInventory.length > 0) {
            await tx.update(inventory)
              .set({ 
                quantity: stockNum, 
                status: stockNum > 0 ? "IN_STOCK" : "OUT_OF_STOCK" 
              })
              .where(eq(inventory.variantId, variant.id))
          } else {
            await tx.insert(inventory).values({
              variantId: variant.id,
              quantity: stockNum,
              status: stockNum > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
            })
          }

          // Update price book entry
          if (basePrice !== undefined) {
            await tx.update(priceBookEntries)
              .set({
                price: Math.round(Number(basePrice) * 100),
                compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null) : undefined,
              })
              .where(eq(priceBookEntries.variantId, variant.id))
          }
        }
      }

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "PRODUCT",
        entityId: id,
        newValue: product,
      }, tx)

      return product
    })
  }

  static async deleteProduct(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const product = await softDeleteProduct(id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "PRODUCT",
        entityId: id,
      }, tx)

      return product
    })
  }

  static async restoreProduct(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const product = await restoreProduct(id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "RESTORE",
        entityType: "PRODUCT",
        entityId: id,
      }, tx)

      return product
    })
  }

  static async hardDeleteProduct(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      // 1. Get variants for the product
      const productVariants = await tx.select().from(variants).where(eq(variants.productId, id))
      const variantIds = productVariants.map((v) => v.id)

      if (variantIds.length > 0) {
        // Delete variant images
        await tx.delete(variantImages).where(inArray(variantImages.variantId, variantIds))
        // Delete price book entries
        await tx.delete(priceBookEntries).where(inArray(priceBookEntries.variantId, variantIds))
        // Delete inventory
        await tx.delete(inventory).where(inArray(inventory.variantId, variantIds))
        // Delete from carts / wishlists items
        await tx.delete(cartItems).where(inArray(cartItems.variantId, variantIds))
        await tx.delete(wishlistItems).where(inArray(wishlistItems.variantId, variantIds))
        // Delete variants
        await tx.delete(variants).where(eq(variants.productId, id))
      }

      // Delete product images
      await tx.delete(productImages).where(eq(productImages.productId, id))
      // Delete product collections
      await tx.delete(productCollections).where(eq(productCollections.productId, id))
      // Delete product tags
      await tx.delete(productTags).where(eq(productTags.productId, id))
      // Delete product materials
      await tx.delete(productMaterials).where(eq(productMaterials.productId, id))
      // Delete product pairings (both as product AND as paired product)
      await tx.delete(productPairings).where(or(eq(productPairings.productId, id), eq(productPairings.pairedProductId, id)))
      // Delete product off section
      await tx.delete(productOffSection).where(eq(productOffSection.productId, id))

      // 2. Delete product itself
      const [deletedProduct] = await tx.delete(products).where(eq(products.id, id)).returning()

      // Log action if adminUserId is a valid UUID
      const isValidUuid = typeof adminUserId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(adminUserId)
      if (isValidUuid) {
        await AdminAuditService.logAction({
          userId: adminUserId,
          action: "DELETE",
          entityType: "PRODUCT",
          entityId: id,
          reason: `Hard delete product: ${deletedProduct?.name || id}`
        }, tx)
      }

      return deletedProduct
    })
  }
}
