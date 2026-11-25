import "server-only"

import { db } from "@/db/client"
import { darazSyncedProducts, darazSyncLogs, darazStockReservations } from "@/db/schema"
import { eq, and, sql, desc, asc, or, ilike, count, isNull, inArray } from "drizzle-orm"

export interface DarazInventoryMetrics {
  totalDarazProducts: number
  totalSkus: number
  activeProducts: number
  inactiveProducts: number
  inStockSkus: number
  lowStockSkus: number
  outOfStockSkus: number
  publishedProducts: number
  unpublishedProducts: number
  activeReservations: number
  failedSyncOperations: number
}

export interface DarazInventoryFilterParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock" | ""
  darazStatus?: "all" | "active" | "inactive" | "pending-qc" | ""
  publicationStatus?: "all" | "published" | "unpublished" | ""
  sortBy?: "stock" | "price" | "lastSync" | "title"
  sortOrder?: "asc" | "desc"
}

/**
 * Fetches real-time inventory statistics from database
 */
export async function getDarazInventoryStats(): Promise<DarazInventoryMetrics> {
  const [productMetrics] = await db
    .select({
      totalProducts: sql<number>`count(distinct ${darazSyncedProducts.darazItemId})::int`,
      totalSkus: sql<number>`count(*)::int`,
      activeProducts: sql<number>`count(distinct case when lower(${darazSyncedProducts.productStatus}) = 'active' then ${darazSyncedProducts.darazItemId} end)::int`,
      inactiveProducts: sql<number>`count(distinct case when lower(${darazSyncedProducts.productStatus}) != 'active' then ${darazSyncedProducts.darazItemId} end)::int`,
      inStockSkus: sql<number>`count(case when ${darazSyncedProducts.websiteAvailableStock} > 5 then 1 end)::int`,
      lowStockSkus: sql<number>`count(case when ${darazSyncedProducts.websiteAvailableStock} > 0 and ${darazSyncedProducts.websiteAvailableStock} <= 5 then 1 end)::int`,
      outOfStockSkus: sql<number>`count(case when ${darazSyncedProducts.websiteAvailableStock} <= 0 then 1 end)::int`,
      publishedProducts: sql<number>`count(distinct case when ${darazSyncedProducts.isPublishedOnWebsite} = true then ${darazSyncedProducts.darazItemId} end)::int`,
      unpublishedProducts: sql<number>`count(distinct case when ${darazSyncedProducts.isPublishedOnWebsite} = false then ${darazSyncedProducts.darazItemId} end)::int`,
    })
    .from(darazSyncedProducts)

  const [reservationMetrics] = await db
    .select({
      activeReservations: sql<number>`count(*)::int`,
    })
    .from(darazStockReservations)
    .where(eq(darazStockReservations.status, "HELD"))

  const [syncMetrics] = await db
    .select({
      failedOperations: sql<number>`count(*)::int`,
    })
    .from(darazSyncLogs)
    .where(eq(darazSyncLogs.status, "FAILED"))

  return {
    totalDarazProducts: productMetrics?.totalProducts || 0,
    totalSkus: productMetrics?.totalSkus || 0,
    activeProducts: productMetrics?.activeProducts || 0,
    inactiveProducts: productMetrics?.inactiveProducts || 0,
    inStockSkus: productMetrics?.inStockSkus || 0,
    lowStockSkus: productMetrics?.lowStockSkus || 0,
    outOfStockSkus: productMetrics?.outOfStockSkus || 0,
    publishedProducts: productMetrics?.publishedProducts || 0,
    unpublishedProducts: productMetrics?.unpublishedProducts || 0,
    activeReservations: reservationMetrics?.activeReservations || 0,
    failedSyncOperations: syncMetrics?.failedOperations || 0,
  }
}

/**
 * Paginated query for Daraz SKU-level inventory with search and filters
 */
export async function findDarazInventoryPaginated(params: DarazInventoryFilterParams) {
  const page = Math.max(1, params.page || 1)
  const limit = Math.max(1, Math.min(100, params.limit || 50))
  const offset = (page - 1) * limit

  const conditions = []

  // 1. Search filter: Title, Item ID, or Seller SKU
  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`
    conditions.push(
      or(
        ilike(darazSyncedProducts.title, term),
        ilike(darazSyncedProducts.darazItemId, term),
        ilike(darazSyncedProducts.sellerSku, term),
        ilike(darazSyncedProducts.skuId, term)
      )
    )
  }

  // 2. Category filter
  if (params.categoryId && params.categoryId !== "all") {
    conditions.push(
      or(
        eq(darazSyncedProducts.primaryCategoryId, params.categoryId),
        ilike(darazSyncedProducts.categoryName, `%${params.categoryId}%`)
      )
    )
  }

  // 3. Stock status filter
  if (params.stockStatus && params.stockStatus !== "all") {
    if (params.stockStatus === "in_stock") {
      conditions.push(sql`${darazSyncedProducts.websiteAvailableStock} > 5`)
    } else if (params.stockStatus === "low_stock") {
      conditions.push(sql`${darazSyncedProducts.websiteAvailableStock} > 0 and ${darazSyncedProducts.websiteAvailableStock} <= 5`)
    } else if (params.stockStatus === "out_of_stock") {
      conditions.push(sql`${darazSyncedProducts.websiteAvailableStock} <= 0`)
    }
  }

  // 4. Daraz product status filter
  if (params.darazStatus && params.darazStatus !== "all") {
    if (params.darazStatus === "active") {
      conditions.push(sql`lower(${darazSyncedProducts.productStatus}) = 'active'`)
    } else if (params.darazStatus === "inactive") {
      conditions.push(sql`lower(${darazSyncedProducts.productStatus}) in ('inactive', 'deactivated')`)
    } else if (params.darazStatus === "pending-qc") {
      conditions.push(sql`lower(${darazSyncedProducts.productStatus}) in ('pending-qc', 'qc')`)
    }
  }

  // 5. Website publication status filter
  if (params.publicationStatus && params.publicationStatus !== "all") {
    if (params.publicationStatus === "published") {
      conditions.push(eq(darazSyncedProducts.isPublishedOnWebsite, true))
    } else if (params.publicationStatus === "unpublished") {
      conditions.push(eq(darazSyncedProducts.isPublishedOnWebsite, false))
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // 6. Sorting
  const sortOrder = params.sortOrder === "asc" ? asc : desc
  let orderByClause
  if (params.sortBy === "stock") {
    orderByClause = sortOrder(darazSyncedProducts.websiteAvailableStock)
  } else if (params.sortBy === "price") {
    orderByClause = sortOrder(darazSyncedProducts.websiteCalculatedPrice)
  } else if (params.sortBy === "title") {
    orderByClause = sortOrder(darazSyncedProducts.title)
  } else {
    // Default: lastSync descending
    orderByClause = sortOrder(darazSyncedProducts.lastSyncedAt)
  }

  // 7. Parallel fetch total count and items
  const [totalRes, items] = await Promise.all([
    db
      .select({ total: count() })
      .from(darazSyncedProducts)
      .where(whereClause),
    db
      .select()
      .from(darazSyncedProducts)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
  ])

  const total = Number(totalRes[0]?.total || 0)
  const totalPages = Math.ceil(total / limit)

  return {
    items,
    total,
    totalPages,
    currentPage: page,
    limit,
  }
}

/**
 * Fetches distinct categories present in the Daraz synced catalogue
 */
export async function getDarazSyncedCategories() {
  const result = await db
    .select({
      categoryId: darazSyncedProducts.primaryCategoryId,
      categoryName: darazSyncedProducts.categoryName,
      productCount: sql<number>`count(distinct ${darazSyncedProducts.darazItemId})::int`,
    })
    .from(darazSyncedProducts)
    .groupBy(darazSyncedProducts.primaryCategoryId, darazSyncedProducts.categoryName)
    .orderBy(desc(sql`count(distinct ${darazSyncedProducts.darazItemId})`))

  return result.filter((c) => c.categoryName)
}

/**
 * Fetches synchronization control panel stats and history
 */
export async function getDarazSyncControlData() {
  const [lastSuccess] = await db
    .select()
    .from(darazSyncLogs)
    .where(eq(darazSyncLogs.status, "SUCCESS"))
    .orderBy(desc(darazSyncLogs.createdAt))
    .limit(1)

  const [lastFailed] = await db
    .select()
    .from(darazSyncLogs)
    .where(eq(darazSyncLogs.status, "FAILED"))
    .orderBy(desc(darazSyncLogs.createdAt))
    .limit(1)

  const [logCounts] = await db
    .select({
      totalSuccess: sql<number>`count(case when ${darazSyncLogs.status} = 'SUCCESS' then 1 end)::int`,
      totalFailed: sql<number>`count(case when ${darazSyncLogs.status} = 'FAILED' then 1 end)::int`,
    })
    .from(darazSyncLogs)

  const recentLogs = await db
    .select()
    .from(darazSyncLogs)
    .orderBy(desc(darazSyncLogs.createdAt))
    .limit(20)

  return {
    lastSuccessfulSync: lastSuccess?.createdAt || null,
    lastFailedSync: lastFailed?.createdAt || null,
    lastFailedDetails: lastFailed?.details || null,
    totalSuccess: logCounts?.totalSuccess || 0,
    totalFailed: logCounts?.totalFailed || 0,
    recentLogs,
  }
}

/**
 * Fetches active or recent stock reservations with contextual details
 */
export async function getStockReservations(limit = 50) {
  return await db
    .select({
      id: darazStockReservations.id,
      orderId: darazStockReservations.orderId,
      sellerSku: darazStockReservations.sellerSku,
      variantId: darazStockReservations.variantId,
      reservedQuantity: darazStockReservations.reservedQuantity,
      status: darazStockReservations.status,
      expiresAt: darazStockReservations.expiresAt,
      createdAt: darazStockReservations.createdAt,
      updatedAt: darazStockReservations.updatedAt,
    })
    .from(darazStockReservations)
    .orderBy(desc(darazStockReservations.createdAt))
    .limit(limit)
}

/**
 * Fetches all failed synchronization operations for the error monitoring panel
 */
export async function getFailedSyncOperations(limit = 50) {
  return await db
    .select()
    .from(darazSyncLogs)
    .where(eq(darazSyncLogs.status, "FAILED"))
    .orderBy(desc(darazSyncLogs.createdAt))
    .limit(limit)
}

/**
 * Fetches full product details and all sibling SKUs for a specific Daraz Item ID
 */
export async function getDarazProductWithSkus(darazItemId: string) {
  const skus = await db
    .select()
    .from(darazSyncedProducts)
    .where(eq(darazSyncedProducts.darazItemId, darazItemId))
    .orderBy(asc(darazSyncedProducts.sellerSku))

  if (skus.length === 0) return null

  const recentLogs = await db
    .select()
    .from(darazSyncLogs)
    .where(eq(darazSyncLogs.darazItemId, darazItemId))
    .orderBy(desc(darazSyncLogs.createdAt))
    .limit(10)

  return {
    item: skus[0],
    skus,
    recentLogs,
  }
}
