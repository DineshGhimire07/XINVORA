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
 * Fetch inventory data for the admin panel with pagination.
 * Joins with variants, products, colors, and sizes.
 */
export async function findAdminInventoryPaginated(
  options: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: "stockQuantity" | "updatedAt"
    sortOrder?: "asc" | "desc"
  } = {}
) {
  const { sql, desc, asc, and, ilike, isNull } = await import("drizzle-orm")
  const { products, variants, colors, sizes, productImages } = await import("../schema")
  
  const page = options.page || 1
  const limit = options.limit || 20
  const offset = (page - 1) * limit

  const conditions: any[] = []

  if (options.status) {
    conditions.push(eq(inventory.status, options.status as any))
  }

  if (options.search) {
    conditions.push(ilike(variants.sku, `%${options.search}%`))
  }

  const baseQuery = db
    .select({
      id: inventory.id,
      variantId: inventory.variantId,
      sku: variants.sku,
      quantity: inventory.quantity,
      reserved: inventory.reserved,
      status: inventory.status,
      updatedAt: inventory.updatedAt,
      productName: products.name,
      color: colors.name,
      size: sizes.name,
      imageUrl: productImages.url,
    })
    .from(inventory)
    .innerJoin(variants, and(eq(inventory.variantId, variants.id), isNull(variants.deletedAt)))
    .innerJoin(products, eq(variants.productId, products.id))
    .leftJoin(colors, eq(variants.colorId, colors.id))
    .leftJoin(sizes, eq(variants.sizeId, sizes.id))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.position, 0)))
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  // Sort settings
  const sortCol = options.sortBy === "stockQuantity" ? inventory.quantity : inventory.updatedAt
  const orderDirection = options.sortOrder === "asc" ? asc(sortCol) : desc(sortCol)

  // Get items and total count concurrently
  const [items, countResult] = await Promise.all([
    baseQuery
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(inventory)
      .innerJoin(variants, and(eq(inventory.variantId, variants.id), isNull(variants.deletedAt)))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
  ])
  const total = Number(countResult[0]?.count ?? 0)

  return {
    items,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}
