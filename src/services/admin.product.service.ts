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
  inventory,
  priceBooks,
  priceBookEntries,
  cartItems,
  wishlistItems
} from "@/db/schema"
import { eq, ne, and, inArray, sql } from "drizzle-orm"

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
  stockQuantity?: string | number
  images?: string[]
  collectionIds?: string[]
  materialIds?: string[]
  seoTitle?: string | null
  seoDescription?: string | null
  sizeStocks?: Record<string, number>
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

      const { basePrice, stockQuantity, images, collectionIds, materialIds, sizeStocks, ...productData } = data
      const product = await insertProduct(productData, tx)

      // Handle images
      if (images && images.length > 0) {
        await tx.insert(productImages).values(
          images.map((url: string, index: number) => ({
            productId: product.id,
            url,
            position: index,
          }))
        )
      }

      // Handle collections
      if (collectionIds && collectionIds.length > 0) {
        await tx.insert(productCollections).values(
          collectionIds.map((cId: string) => ({
            productId: product.id,
            collectionId: cId,
          }))
        )
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

      // Resolve Default Price Book
      let priceBook = await tx.select().from(priceBooks).where(eq(priceBooks.currency, "USD")).limit(1)
      let priceBookId
      if (priceBook.length === 0) {
        const [newPb] = await tx.insert(priceBooks).values({
          name: "Default USD",
          currency: "USD",
          isDefault: true
        }).returning()
        priceBookId = newPb.id
      } else {
        priceBookId = priceBook[0].id
      }

      const sizeEntries = sizeStocks ? Object.entries(sizeStocks) : []
      if (sizeEntries.length > 0) {
        // Create variants for each size specified
        for (const [sizeId, qty] of sizeEntries) {
          const quantity = Number(qty) || 0
          const uniqueSuffix = crypto.randomUUID().slice(0, 8)
          const [variant] = await tx.insert(variants).values({
            productId: product.id,
            sku: `${product.slug}-${sizeId.slice(0, 4)}-${uniqueSuffix}`,
            sizeId: sizeId,
          }).returning()

          await tx.insert(inventory).values({
            variantId: variant.id,
            quantity,
            status: quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
          })

          await tx.insert(priceBookEntries).values({
            priceBookId: priceBookId,
            variantId: variant.id,
            price: Math.round(Number(basePrice) * 100),
          })
        }
      } else {
        // Create single fallback base variant
        const uniqueSuffix = crypto.randomUUID().slice(0, 8)
        const [variant] = await tx.insert(variants).values({
          productId: product.id,
          sku: `${product.slug}-base-${uniqueSuffix}`,
        }).returning()

        const quantity = Number(stockQuantity) || 0
        await tx.insert(inventory).values({
          variantId: variant.id,
          quantity,
          status: quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
        })

        await tx.insert(priceBookEntries).values({
          priceBookId: priceBookId,
          variantId: variant.id,
          price: Math.round(Number(basePrice) * 100),
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
      // Validate slug uniqueness on update
      if (data.slug) {
        const existing = await findProductBySlug(data.slug)
        if (existing && existing.id !== id) {
          throw new Error("Slug already in use.")
        }
      }

      const { basePrice, stockQuantity, images, collectionIds, materialIds, sizeStocks, ...productData } = data
      const product = await updateProduct(id, productData, tx)

      // Update images
      await tx.delete(productImages).where(eq(productImages.productId, id))
      if (images && images.length > 0) {
        await tx.insert(productImages).values(
          images.map((url: string, index: number) => ({
            productId: id,
            url,
            position: index,
          }))
        )
      }

      // Update collections
      await tx.delete(productCollections).where(eq(productCollections.productId, id))
      if (collectionIds && collectionIds.length > 0) {
        await tx.insert(productCollections).values(
          collectionIds.map((cId: string) => ({
            productId: id,
            collectionId: cId,
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

      // Update variants & inventory for sizes if sizeStocks is passed
      if (sizeStocks) {
        // Resolve Default Price Book
        let priceBook = await tx.select().from(priceBooks).where(eq(priceBooks.currency, "USD")).limit(1)
        let priceBookId
        if (priceBook.length === 0) {
          const [newPb] = await tx.insert(priceBooks).values({
            name: "Default USD",
            currency: "USD",
            isDefault: true
          }).returning()
          priceBookId = newPb.id
        } else {
          priceBookId = priceBook[0].id
        }

        const existingVariants = await tx.select().from(variants).where(eq(variants.productId, id))
        
        for (const [sizeId, qty] of Object.entries(sizeStocks)) {
          const delta = Number(qty) || 0
          const match = existingVariants.find(v => v.sizeId === sizeId)

          if (match) {
            // Update quantity via delta atomically
            const existingInventory = await tx.select().from(inventory).where(eq(inventory.variantId, match.id)).limit(1)
            if (existingInventory.length > 0) {
              const nextQty = existingInventory[0].quantity + delta
              if (nextQty < 0) {
                throw new Error(`Inventory quantity for size ${sizeId} cannot be negative.`)
              }
              await tx.update(inventory)
                .set({ 
                  quantity: sql`${inventory.quantity} + ${delta}`, 
                  status: nextQty > 0 ? "IN_STOCK" : "OUT_OF_STOCK" 
                })
                .where(eq(inventory.variantId, match.id))
            } else {
              if (delta < 0) {
                throw new Error(`Inventory quantity for size ${sizeId} cannot be negative.`)
              }
              await tx.insert(inventory).values({
                variantId: match.id,
                quantity: delta,
                status: delta > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
              })
            }
            // Update price
            if (basePrice !== undefined) {
              await tx.update(priceBookEntries)
                .set({ price: Math.round(Number(basePrice) * 100) })
                .where(eq(priceBookEntries.variantId, match.id))
            }
          } else {
            // Create new size variant
            if (delta < 0) {
              throw new Error(`Initial stock for size ${sizeId} cannot be negative.`)
            }
            const uniqueSuffix = crypto.randomUUID().slice(0, 8)
            const [variant] = await tx.insert(variants).values({
              productId: id,
              sku: `${product.slug}-${sizeId.slice(0, 4)}-${uniqueSuffix}`,
              sizeId: sizeId,
            }).returning()

            await tx.insert(inventory).values({
              variantId: variant.id,
              quantity: delta,
              status: delta > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
            })

            await tx.insert(priceBookEntries).values({
              priceBookId: priceBookId,
              variantId: variant.id,
              price: Math.round(Number(basePrice) * 100),
            })
          }
        }
      } else {
        // Fallback to update base variant inventory
        const [variant] = await tx.select().from(variants).where(eq(variants.productId, id)).limit(1)
        if (variant && stockQuantity !== undefined) {
          const delta = Number(stockQuantity)
          
          const existingInventory = await tx.select().from(inventory).where(eq(inventory.variantId, variant.id)).limit(1)
          if (existingInventory.length > 0) {
            const nextQty = existingInventory[0].quantity + delta
            if (nextQty < 0) {
              throw new Error("Inventory quantity cannot be negative.")
            }
            await tx.update(inventory)
              .set({ 
                quantity: sql`${inventory.quantity} + ${delta}`, 
                status: nextQty > 0 ? "IN_STOCK" : "OUT_OF_STOCK" 
              })
              .where(eq(inventory.variantId, variant.id))
          } else {
            if (delta < 0) {
              throw new Error("Inventory quantity cannot be negative.")
            }
            await tx.insert(inventory).values({
              variantId: variant.id,
              quantity: delta,
              status: delta > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
            })
          }

          // Update price book entry
          if (basePrice !== undefined) {
            await tx.update(priceBookEntries)
              .set({ price: Math.round(Number(basePrice) * 100) })
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

      // 2. Delete product itself
      const [deletedProduct] = await tx.delete(products).where(eq(products.id, id)).returning()

      // Log action
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "PRODUCT",
        entityId: id,
        reason: `Hard delete product: ${deletedProduct?.name || id}`
      }, tx)

      return deletedProduct
    })
  }
}
