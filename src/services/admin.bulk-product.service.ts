import "server-only"
import { db } from "@/db/client"
import { findProductBySlug } from "@/db/queries/products"
import { AiContentEngine } from "@/domains/seo/engines/ai-content.engine"
import { AdminAuditService } from "./admin.audit.service"
import {
  products,
  categories,
  brands,
  sizes,
  variants,
  inventory,
  priceBooks,
  priceBookEntries,
  productImages
} from "@/db/schema"
import { eq, sql, ilike } from "drizzle-orm"

export interface BulkProductItemInput {
  name: string
  categoryName: string
  brandName?: string | null
  basePrice: number | string
  compareAtPrice?: number | string | null
  stockQuantity?: number | string
  sizes?: string | null // e.g. "S:10, M:15, L:20" or "Free Size (Fits XS-M):1" or "S, M, L"
  badge?: string | null
  shortDescription?: string | null
  description?: string | null
  details?: string | null
  careGuide?: string | null
  sizeGuide?: string | null
  virtualTryonPrompt?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  images?: string[]
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}

export interface BulkImportResult {
  total: number
  succeeded: number
  failed: number
  createdProducts: { id: string; name: string; slug: string; status: string }[]
  errors: { row: number; name: string; error: string }[]
}

export class AdminBulkProductService {
  /**
   * Processes a batch of product records in a Drizzle database transaction.
   * Auto-resolves categories, brands, sizes, unique slugs, and missing content.
   */
  static async bulkCreateProducts(
    items: BulkProductItemInput[],
    adminUserId: string
  ): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      total: items.length,
      succeeded: 0,
      failed: 0,
      createdProducts: [],
      errors: []
    }

    if (!items || items.length === 0) {
      return result
    }

    return await db.transaction(async (tx) => {
      // 1. Resolve Default Price Book
      let defaultPriceBook = await tx
        .select()
        .from(priceBooks)
        .where(eq(priceBooks.isDefault, true))
        .limit(1)

      let priceBookId = defaultPriceBook[0]?.id
      if (!priceBookId) {
        const [newPb] = await tx
          .insert(priceBooks)
          .values({
            name: "Default NPR",
            currency: "NPR",
            isDefault: true
          })
          .returning()
        priceBookId = newPb.id
      }

      // Fetch existing Categories, Brands, and Sizes to minimize DB roundtrips
      const existingCategories = await tx.select().from(categories)
      const existingBrands = await tx.select().from(brands)
      const existingSizes = await tx.select().from(sizes)

      const categoryMap = new Map<string, string>(
        existingCategories.map((c) => [c.name.toLowerCase().trim(), c.id])
      )
      const brandMap = new Map<string, string>(
        existingBrands.map((b) => [b.name.toLowerCase().trim(), b.id])
      )
      const sizeMap = new Map<string, { id: string; name: string }>()
      existingSizes.forEach((s) => {
        sizeMap.set(s.name.toLowerCase().trim(), { id: s.id, name: s.name })
        if (s.abbreviation) {
          sizeMap.set(s.abbreviation.toLowerCase().trim(), { id: s.id, name: s.name })
        }
      })

      // Helper function to resolve or create category
      const resolveCategory = async (catName: string): Promise<string> => {
        const key = catName.toLowerCase().trim()
        if (categoryMap.has(key)) {
          return categoryMap.get(key)!
        }
        // Auto-create missing category
        const catSlug = key
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-") || `category-${Date.now()}`

        const [newCat] = await tx
          .insert(categories)
          .values({
            name: catName.trim(),
            slug: catSlug,
            description: `Collection of ${catName.trim()}`
          })
          .returning()

        categoryMap.set(key, newCat.id)
        return newCat.id
      }

      // Helper function to resolve or create brand
      const resolveBrand = async (bName?: string | null): Promise<string | null> => {
        if (!bName || !bName.trim()) return null
        const key = bName.toLowerCase().trim()
        if (brandMap.has(key)) {
          return brandMap.get(key)!
        }
        const bSlug = key
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-") || `brand-${Date.now()}`

        const [newBrand] = await tx
          .insert(brands)
          .values({
            name: bName.trim(),
            slug: bSlug
          })
          .returning()

        brandMap.set(key, newBrand.id)
        return newBrand.id
      }

      // Helper function to resolve or create size
      const resolveSize = async (sizeName: string): Promise<string> => {
        const key = sizeName.toLowerCase().trim()
        if (sizeMap.has(key)) {
          return sizeMap.get(key)!.id
        }
        const abbr = sizeName.trim().length <= 10 ? sizeName.trim() : sizeName.trim().slice(0, 10)
        const [newSize] = await tx
          .insert(sizes)
          .values({
            name: sizeName.trim(),
            abbreviation: abbr,
            category: "CLOTHING"
          })
          .returning()

        sizeMap.set(key, { id: newSize.id, name: newSize.name })
        return newSize.id
      }

      // Process items row by row
      for (let i = 0; i < items.length; i++) {
        const rowNum = i + 1
        const item = items[i]

        try {
          if (!item.name || !item.name.trim()) {
            throw new Error("Product name is required.")
          }
          if (!item.categoryName || !item.categoryName.trim()) {
            throw new Error("Category name is required.")
          }

          const basePriceNum = Number(item.basePrice)
          if (isNaN(basePriceNum) || basePriceNum <= 0) {
            throw new Error("Valid positive base price is required.")
          }

          // 1. Generate or complete AI Content if fields are missing
          const aiGenerated = AiContentEngine.generateContent(item.name, item.categoryName)

          const finalShortDesc = item.shortDescription && item.shortDescription.trim().length >= 30
            ? item.shortDescription.trim()
            : aiGenerated.shortDescription

          const finalDesc = item.description && item.description.trim()
            ? item.description.trim()
            : aiGenerated.description

          const finalDetails = item.details && item.details.trim()
            ? item.details.trim()
            : aiGenerated.details

          const finalCareGuide = item.careGuide && item.careGuide.trim()
            ? item.careGuide.trim()
            : aiGenerated.careGuide

          const finalSizeGuide = item.sizeGuide && item.sizeGuide.trim()
            ? item.sizeGuide.trim()
            : aiGenerated.sizeGuide

          const finalTryonPrompt = item.virtualTryonPrompt && item.virtualTryonPrompt.trim()
            ? item.virtualTryonPrompt.trim()
            : aiGenerated.virtualTryonPrompt

          const finalSeoTitle = item.seoTitle && item.seoTitle.trim()
            ? item.seoTitle.trim()
            : aiGenerated.seoTitle

          const finalSeoDescription = item.seoDescription && item.seoDescription.trim()
            ? item.seoDescription.trim()
            : aiGenerated.seoDescription

          const finalSeoKeywords = item.seoKeywords && item.seoKeywords.trim()
            ? item.seoKeywords.trim()
            : aiGenerated.seoKeywords

          // 2. Resolve Category & Brand IDs
          const categoryId = await resolveCategory(item.categoryName)
          const brandId = await resolveBrand(item.brandName)

          // 3. Resolve Unique Slug
          let baseSlug = aiGenerated.slug
          let uniqueSlug = baseSlug
          let counter = 1
          while (true) {
            const existing = await tx
              .select({ id: products.id })
              .from(products)
              .where(eq(products.slug, uniqueSlug))
              .limit(1)

            if (existing.length === 0) break
            uniqueSlug = `${baseSlug}-${counter}`
            counter++
          }

          // 4. Create Product Entry
          const productStatus = item.status || "DRAFT"
          const compareAtPriceNum = item.compareAtPrice ? Number(item.compareAtPrice) : null

          const [newProduct] = await tx
            .insert(products)
            .values({
              name: item.name.trim(),
              slug: uniqueSlug,
              shortDescription: finalShortDesc,
              description: finalDesc,
              details: finalDetails,
              careGuide: finalCareGuide,
              sizeGuide: finalSizeGuide,
              virtualTryonPrompt: finalTryonPrompt,
              badge: item.badge ? item.badge.trim() : null,
              categoryId: categoryId,
              brandId: brandId,
              status: productStatus,
              seoTitle: finalSeoTitle,
              seoDescription: finalSeoDescription,
              seoKeywords: finalSeoKeywords
            })
            .returning()

          // 5. Create Images if provided
          if (item.images && item.images.length > 0) {
            await tx.insert(productImages).values(
              item.images.map((url, idx) => ({
                productId: newProduct.id,
                url: url.trim(),
                position: idx
              }))
            )
          }

          // 6. Parse and Resolve Sizes & Inventory
          const sizeStockMap: Record<string, number> = {} // sizeId -> stock
          const rawTotalStock = Number(item.stockQuantity) || 0

          if (item.sizes && item.sizes.trim()) {
            const sizeParts = item.sizes.split(",").map((s) => s.trim()).filter(Boolean)

            // Check if sizes are specified with stock (e.g. "S:10, M:15" or "Free Size (Fits XS-M):1")
            const hasStockPairs = sizeParts.some((p) => p.includes(":"))

            if (hasStockPairs) {
              for (const part of sizeParts) {
                const [szName, qtyStr] = part.split(":").map((s) => s.trim())
                if (szName) {
                  const qty = Number(qtyStr) || 0
                  const szId = await resolveSize(szName)
                  sizeStockMap[szId] = qty
                }
              }
            } else {
              // Simple size list like "S, M, L" -> split rawTotalStock evenly
              const resolvedSizeIds: string[] = []
              for (const szName of sizeParts) {
                const szId = await resolveSize(szName)
                resolvedSizeIds.push(szId)
              }
              const sizeCount = resolvedSizeIds.length
              const qtyPerSize = sizeCount > 0 ? Math.floor(rawTotalStock / sizeCount) : rawTotalStock
              resolvedSizeIds.forEach((szId) => {
                sizeStockMap[szId] = qtyPerSize
              })
            }
          }

          const activeSizeEntries = Object.entries(sizeStockMap)

          if (activeSizeEntries.length > 0) {
            // Create a variant per size
            for (const [sizeId, qty] of activeSizeEntries) {
              const uniqueSuffix = crypto.randomUUID().slice(0, 8)
              const [variant] = await tx
                .insert(variants)
                .values({
                  productId: newProduct.id,
                  sku: `${newProduct.slug}-${sizeId.slice(0, 4)}-${uniqueSuffix}`,
                  sizeId: sizeId
                })
                .returning()

              await tx.insert(inventory).values({
                variantId: variant.id,
                quantity: qty,
                status: qty > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
              })

              await tx.insert(priceBookEntries).values({
                priceBookId: priceBookId,
                variantId: variant.id,
                price: Math.round(basePriceNum * 100),
                compareAtPrice: compareAtPriceNum ? Math.round(compareAtPriceNum * 100) : null
              })
            }
          } else {
            // Fallback: create base single variant
            const uniqueSuffix = crypto.randomUUID().slice(0, 8)
            const [variant] = await tx
              .insert(variants)
              .values({
                productId: newProduct.id,
                sku: `${newProduct.slug}-base-${uniqueSuffix}`
              })
              .returning()

            await tx.insert(inventory).values({
              variantId: variant.id,
              quantity: rawTotalStock,
              status: rawTotalStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
            })

            await tx.insert(priceBookEntries).values({
              priceBookId: priceBookId,
              variantId: variant.id,
              price: Math.round(basePriceNum * 100),
              compareAtPrice: compareAtPriceNum ? Math.round(compareAtPriceNum * 100) : null
            })
          }

          // Audit log action
          await AdminAuditService.logAction(
            {
              userId: adminUserId,
              action: "CREATE",
              entityType: "PRODUCT",
              entityId: newProduct.id,
              newValue: newProduct
            },
            tx
          )

          result.succeeded++
          result.createdProducts.push({
            id: newProduct.id,
            name: newProduct.name,
            slug: newProduct.slug,
            status: newProduct.status
          })
        } catch (err: any) {
          result.failed++
          result.errors.push({
            row: rowNum,
            name: item.name || `Row ${rowNum}`,
            error: err.message || "Failed to process item"
          })
        }
      }

      return result
    })
  }
}
