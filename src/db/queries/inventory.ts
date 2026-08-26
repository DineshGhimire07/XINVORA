/**
 * db/queries/inventory.ts — XINVORA Inventory Repository
 *
 * Business-oriented read queries for Inventory stock.
 * Keeps inventory checks clean and isolated from product browsing.
 */

import "server-only"
import { eq } from "drizzle-orm"
import { db } from "../client"
import { inventory } from "../schema"

/**
 * Fetch the raw inventory details for a specific Variant ID.
 */
export async function findInventoryByVariantId(variantId: string) {
  const result = await db.query.inventory.findFirst({
    where: eq(inventory.variantId, variantId),
  })
  return result ?? null
}

/**
 * Fetch the net available stock for a specific Variant ID.
 * Defined as: Physical Quantity - Reserved Quantity (items currently locked in active carts or pending checkouts).
 */
export async function getAvailableStock(variantId: string): Promise<number> {
  const record = await db.query.inventory.findFirst({
    where: eq(inventory.variantId, variantId),
    columns: {
      quantity: true,
      reserved: true,
    },
  })

  if (!record) return 0
  const available = record.quantity - record.reserved
  return available > 0 ? available : 0
}

/**
 * Fetch inventory summary statistics for the admin dashboard/inventory KPI cards.
 */
export async function getInventoryStats() {
  const { sql, and, isNull } = await import("drizzle-orm")
  const { products, variants, inventory } = await import("../schema")

  const [stats] = await db
    .select({
      totalVariants: sql<number>`count(distinct ${variants.id})`,
      totalPhysicalStock: sql<number>`coalesce(sum(${inventory.quantity}), 0)`,
      inStockCount: sql<number>`count(case when ${inventory.quantity} > ${inventory.lowStockThreshold} then 1 end)`,
      lowStockCount: sql<number>`count(case when ${inventory.quantity} > 0 and ${inventory.quantity} <= ${inventory.lowStockThreshold} then 1 end)`,
      outOfStockCount: sql<number>`count(case when ${inventory.quantity} <= 0 then 1 end)`,
    })
    .from(inventory)
    .innerJoin(variants, and(eq(inventory.variantId, variants.id), isNull(variants.deletedAt)))
    .innerJoin(products, and(eq(variants.productId, products.id), isNull(products.deletedAt)))

  return {
    totalVariants: Number(stats?.totalVariants || 0),
    totalPhysicalStock: Number(stats?.totalPhysicalStock || 0),
    inStockCount: Number(stats?.inStockCount || 0),
    lowStockCount: Number(stats?.lowStockCount || 0),
    outOfStockCount: Number(stats?.outOfStockCount || 0),
  }
}

/**
 * Fetch inventory data for the admin panel with pagination.
 * Joins with variants, products, categories, colors, sizes, and price book entries.
 */
export async function findAdminInventoryPaginated(
  options: {
    page?: number
    limit?: number
    search?: string
    status?: string
    categoryId?: string
    sortBy?: "stockQuantity" | "updatedAt" | "productName" | "sku"
    sortOrder?: "asc" | "desc"
  } = {}
) {
  const { sql, desc, asc, and, or, ilike, isNull, eq } = await import("drizzle-orm")
  const { products, variants, colors, sizes, productImages, categories, priceBookEntries, priceBooks } = await import("../schema")
  
  const page = options.page || 1
  const limit = options.limit || 30
  const offset = (page - 1) * limit

  const conditions: any[] = [
    isNull(products.deletedAt),
    isNull(variants.deletedAt)
  ]

  if (options.status) {
    if (options.status === "IN_STOCK") {
      conditions.push(sql`${inventory.quantity} > ${inventory.lowStockThreshold}`)
    } else if (options.status === "LOW_STOCK") {
      conditions.push(sql`${inventory.quantity} > 0 and ${inventory.quantity} <= ${inventory.lowStockThreshold}`)
    } else if (options.status === "OUT_OF_STOCK") {
      conditions.push(sql`${inventory.quantity} <= 0`)
    }
  }

  if (options.categoryId) {
    conditions.push(eq(products.categoryId, options.categoryId))
  }

  if (options.search) {
    const q = `%${options.search.trim()}%`
    conditions.push(
      or(
        ilike(variants.sku, q),
        ilike(products.name, q),
        ilike(colors.name, q),
        ilike(sizes.name, q)
      )
    )
  }

  const baseQuery = db
    .select({
      id: inventory.id,
      variantId: inventory.variantId,
      sku: variants.sku,
      quantity: inventory.quantity,
      reserved: inventory.reserved,
      lowStockThreshold: inventory.lowStockThreshold,
      status: inventory.status,
      updatedAt: inventory.updatedAt,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      productStatus: products.status,
      categoryName: categories.name,
      colorId: colors.id,
      color: colors.name,
      colorHex: colors.hexCode,
      sizeId: sizes.id,
      size: sizes.name,
      sizeAbbr: sizes.abbreviation,
      imageUrl: sql<string>`(
        SELECT url 
        FROM product_images 
        WHERE product_id = ${products.id} 
        ORDER BY position ASC 
        LIMIT 1
      )`,
      price: sql<number>`coalesce((
        SELECT pbe.price 
        FROM price_book_entries pbe
        INNER JOIN price_books pb ON pbe.price_book_id = pb.id
        WHERE pbe.variant_id = ${variants.id} AND pb.is_default = true
        LIMIT 1
      ), 0)`,
    })
    .from(inventory)
    .innerJoin(variants, eq(inventory.variantId, variants.id))
    .innerJoin(products, eq(variants.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(colors, eq(variants.colorId, colors.id))
    .leftJoin(sizes, eq(variants.sizeId, sizes.id))
    .where(and(...conditions))

  // Dynamic sorting
  let sortExpression
  if (options.sortBy === "stockQuantity") {
    sortExpression = inventory.quantity
  } else if (options.sortBy === "productName") {
    sortExpression = products.name
  } else if (options.sortBy === "sku") {
    sortExpression = variants.sku
  } else {
    sortExpression = inventory.updatedAt
  }

  const orderDirection = options.sortOrder === "asc" ? asc(sortExpression) : desc(sortExpression)

  // Get items and total count concurrently
  const [items, countResult] = await Promise.all([
    baseQuery
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(inventory)
      .innerJoin(variants, eq(inventory.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .leftJoin(colors, eq(variants.colorId, colors.id))
      .leftJoin(sizes, eq(variants.sizeId, sizes.id))
      .where(and(...conditions))
  ])
  const total = Number(countResult[0]?.count ?? 0)

  return {
    items,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}
