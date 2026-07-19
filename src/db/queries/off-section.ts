/**
 * db/queries/off-section.ts — XINVORA Off Section Repository
 *
 * Read queries for the Off Section admin panel and storefront integration.
 * All write operations go through the service layer.
 */

import "server-only"
import { eq, and, ilike, sql, inArray, desc, isNull } from "drizzle-orm"
import { db } from "../client"
import {
  productOffSection,
  products,
  categories,
  productImages,
  variants,
  priceBookEntries,
  priceBooks,
} from "../schema"

export interface OffSectionListParams {
  page?: number
  limit?: number
  search?: string
  status?: "active" | "inactive" | "all"
  categoryId?: string
}

export interface OffSectionProduct {
  id: string
  productId: string
  productName: string
  productSlug: string
  sku: string | null
  categoryName: string | null
  thumbnailUrl: string | null
  originalPrice: number
  sellingPrice: number
  currentPrice: number | null
  isOffEnabled: boolean
  createdAt: Date
}

/**
 * Paginated listing of all products in the Off Section, with product details.
 */
export async function findOffSectionProducts(
  params: OffSectionListParams = {}
): Promise<{
  items: OffSectionProduct[]
  total: number
  totalPages: number
  currentPage: number
}> {
  const page = params.page || 1
  const limit = params.limit || 20
  const offset = (page - 1) * limit

  const conditions: any[] = []

  if (params.search) {
    conditions.push(ilike(products.name, `%${params.search}%`))
  }

  if (params.status === "active") {
    conditions.push(eq(productOffSection.isOffEnabled, true))
  } else if (params.status === "inactive") {
    conditions.push(eq(productOffSection.isOffEnabled, false))
  }

  if (params.categoryId) {
    conditions.push(eq(products.categoryId, params.categoryId))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [items, countResult] = await Promise.all([
    db
      .select({
        id: productOffSection.id,
        productId: productOffSection.productId,
        productName: products.name,
        productSlug: products.slug,
        categoryName: categories.name,
        originalPrice: productOffSection.originalPrice,
        sellingPrice: productOffSection.sellingPrice,
        isOffEnabled: productOffSection.isOffEnabled,
        createdAt: productOffSection.createdAt,
      })
      .from(productOffSection)
      .innerJoin(products, eq(productOffSection.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(productOffSection.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productOffSection)
      .innerJoin(products, eq(productOffSection.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause),
  ])

  const total = Number(countResult[0]?.count ?? 0)

  // Fetch thumbnails and SKUs for the items
  const productIds = items.map((i) => i.productId)

  const [thumbnails, skuResults, priceResults] = productIds.length > 0
    ? await Promise.all([
        db
          .select({
            productId: productImages.productId,
            url: productImages.url,
          })
          .from(productImages)
          .where(
            and(
              inArray(productImages.productId, productIds),
              eq(productImages.position, 0)
            )
          ),
        db
          .select({
            productId: variants.productId,
            sku: variants.sku,
          })
          .from(variants)
          .where(
            and(
              inArray(variants.productId, productIds),
              isNull(variants.deletedAt),
              eq(variants.isActive, true)
            )
          ),
        db
          .select({
            productId: variants.productId,
            price: priceBookEntries.price,
          })
          .from(variants)
          .innerJoin(priceBookEntries, eq(variants.id, priceBookEntries.variantId))
          .innerJoin(
            priceBooks,
            and(eq(priceBookEntries.priceBookId, priceBooks.id), eq(priceBooks.isDefault, true))
          )
          .where(
            and(
              inArray(variants.productId, productIds),
              isNull(variants.deletedAt),
              eq(variants.isActive, true)
            )
          ),
      ])
    : [[], [], []]

  const enrichedItems: OffSectionProduct[] = items.map((item) => {
    const thumb = thumbnails.find((t) => t.productId === item.productId)
    const skuRow = skuResults.find((s) => s.productId === item.productId)
    const priceRows = priceResults.filter((p) => p.productId === item.productId)
    const currentPrice = priceRows.length > 0 ? Math.min(...priceRows.map((p) => p.price)) : null

    return {
      ...item,
      sku: skuRow?.sku ?? null,
      thumbnailUrl: thumb?.url ?? null,
      currentPrice,
    }
  })

  return {
    items: enrichedItems,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}

/**
 * Single record lookup by off-section ID.
 */
export async function findOffSectionById(id: string) {
  const result = await db
    .select()
    .from(productOffSection)
    .where(eq(productOffSection.id, id))
    .limit(1)
  return result[0] ?? null
}

/**
 * Check if a product is already in the Off Section.
 */
export async function isProductInOffSection(productId: string): Promise<boolean> {
  const result = await db
    .select({ id: productOffSection.id })
    .from(productOffSection)
    .where(eq(productOffSection.productId, productId))
    .limit(1)
  return result.length > 0
}

/**
 * Batch-fetch Off Section data for a list of product IDs.
 * Used by storefront queries to overlay OFF pricing on product cards.
 */
export async function findOffSectionByProductIds(
  productIds: string[]
): Promise<Map<string, { originalPrice: number; sellingPrice: number; isOffEnabled: boolean }>> {
  if (productIds.length === 0) return new Map()

  const rows = await db
    .select({
      productId: productOffSection.productId,
      originalPrice: productOffSection.originalPrice,
      sellingPrice: productOffSection.sellingPrice,
      isOffEnabled: productOffSection.isOffEnabled,
    })
    .from(productOffSection)
    .where(
      and(
        inArray(productOffSection.productId, productIds),
        eq(productOffSection.isOffEnabled, true)
      )
    )

  const map = new Map<string, { originalPrice: number; sellingPrice: number; isOffEnabled: boolean }>()
  for (const row of rows) {
    map.set(row.productId, {
      originalPrice: row.originalPrice,
      sellingPrice: row.sellingPrice,
      isOffEnabled: row.isOffEnabled,
    })
  }
  return map
}
