import "server-only"
import { eq, and, desc, asc, sql, gte, lte, lt, isNull, isNotNull, inArray } from "drizzle-orm"
import { db } from "../client"
import { orders, orderItems, users, products, variants, inventory, categories, userSessions, userEvents, searchQueries, collections, backInStockRequests, customerMetrics } from "../schema"
import { unstable_cache } from "next/cache"

// Dashboard data is cached for 5 minutes.
// Admin metrics being 5 minutes stale is perfectly acceptable and prevents
// the admin page from firing 6+ heavy SQL queries (COUNT DISTINCT, regex,
// correlated subqueries) on every single page load.
const DASHBOARD_CACHE_TTL = 300 // 5 minutes


function calculatePercentChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%"
  }
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? "+" : ""
  return `${sign}${change.toFixed(1)}%`
}

const _getDashboardStats = async () => {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Fetch orders and customers stats in parallel
  const [
    [thisWeekOrdersResult],
    [lastWeekOrdersResult],
    [thisWeekCustomersResult],
    [lastWeekCustomersResult],
  ] = await Promise.all([
    db
      .select({
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, sevenDaysAgo), isNull(orders.deletedAt))),
    db
      .select({
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, fourteenDaysAgo), lt(orders.createdAt, sevenDaysAgo), isNull(orders.deletedAt))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.role, "CUSTOMER"), isNull(users.deletedAt), lt(users.createdAt, now))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.role, "CUSTOMER"), isNull(users.deletedAt), lt(users.createdAt, sevenDaysAgo))),
  ])

  const thisWeekRevenue = Number(thisWeekOrdersResult?.revenue ?? 0)
  const thisWeekOrdersCount = Number(thisWeekOrdersResult?.count ?? 0)
  const lastWeekRevenue = Number(lastWeekOrdersResult?.revenue ?? 0)
  const lastWeekOrdersCount = Number(lastWeekOrdersResult?.count ?? 0)
  const thisWeekCustomersCount = Number(thisWeekCustomersResult?.count ?? 0)
  const lastWeekCustomersCount = Number(lastWeekCustomersResult?.count ?? 0)

  // 3. Compute AOV
  const thisWeekAOV = thisWeekOrdersCount > 0 ? thisWeekRevenue / thisWeekOrdersCount : 0
  const lastWeekAOV = lastWeekOrdersCount > 0 ? lastWeekRevenue / lastWeekOrdersCount : 0

  return {
    revenue: {
      value: thisWeekRevenue,
      change: calculatePercentChange(thisWeekRevenue, lastWeekRevenue),
      isPositive: thisWeekRevenue >= lastWeekRevenue,
    },
    orders: {
      value: thisWeekOrdersCount,
      change: calculatePercentChange(thisWeekOrdersCount, lastWeekOrdersCount),
      isPositive: thisWeekOrdersCount >= lastWeekOrdersCount,
    },
    customers: {
      value: thisWeekCustomersCount,
      change: calculatePercentChange(thisWeekCustomersCount, lastWeekCustomersCount),
      isPositive: thisWeekCustomersCount >= lastWeekCustomersCount,
    },
    aov: {
      value: thisWeekAOV,
      change: calculatePercentChange(thisWeekAOV, lastWeekAOV),
      isPositive: thisWeekAOV >= lastWeekAOV,
    },
  }
}

export const getDashboardStats = unstable_cache(
  _getDashboardStats,
  ["dashboard-stats"],
  { tags: ["dashboard"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getSalesOverviewChart = async () => {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const allOrders = await db
    .select({
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, fourteenDaysAgo), isNull(orders.deletedAt)))
    .orderBy(asc(orders.createdAt))

  const chartData = []
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const dateForDay = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateString = dateForDay.toDateString()
    const dayName = daysOfWeek[dateForDay.getDay()]

    // Match orders in this week for this calendar day
    const thisWeekRevenue = allOrders
      .filter(o => o.createdAt.toDateString() === dateString)
      .reduce((sum, o) => sum + o.total, 0)

    // Match orders in last week (7 days prior)
    const priorDate = new Date(dateForDay.getTime() - 7 * 24 * 60 * 60 * 1000)
    const priorDateString = priorDate.toDateString()
    const lastWeekRevenue = allOrders
      .filter(o => o.createdAt.toDateString() === priorDateString)
      .reduce((sum, o) => sum + o.total, 0)

    chartData.push({
      name: dayName,
      thisWeek: thisWeekRevenue / 100, // converted to standard currency value
      lastWeek: lastWeekRevenue / 100,
    })
  }

  return chartData
}

export const getSalesOverviewChart = unstable_cache(
  _getSalesOverviewChart,
  ["dashboard-sales-chart"],
  { tags: ["dashboard"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getRecentOrders = async () => {
  return await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      customerName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
      itemCount: sql<number>`coalesce((select sum(${orderItems.quantity}) from ${orderItems} where ${orderItems.orderId} = ${orders.id}), 0)`,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(isNull(orders.deletedAt))
    .orderBy(desc(orders.createdAt))
    .limit(5)
}

export const getRecentOrders = unstable_cache(
  _getRecentOrders,
  ["dashboard-recent-orders"],
  { tags: ["dashboard", "orders"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getTopProducts = async () => {
  return await db
    .select({
      name: sql<string>`coalesce(${products.name}, ${orderItems.productName})`,
      slug: products.slug,
      unitsSold: sql<number>`sum(${orderItems.quantity})`,
      revenue: sql<number>`sum(${orderItems.totalPrice})`,
    })
    .from(orderItems)
    .leftJoin(variants, eq(orderItems.variantId, variants.id))
    .leftJoin(products, eq(variants.productId, products.id))
    .groupBy(products.id, products.name, products.slug, orderItems.productName)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5)
}

export const getTopProducts = unstable_cache(
  _getTopProducts,
  ["dashboard-top-products"],
  { tags: ["dashboard", "products"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getOrdersByStatus = async () => {
  return await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(isNull(orders.deletedAt))
    .groupBy(orders.status)
}

export const getOrdersByStatus = unstable_cache(
  _getOrdersByStatus,
  ["dashboard-orders-by-status"],
  { tags: ["dashboard", "orders"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getLowStockAlert = async () => {
  return await db
    .select({
      id: variants.id,
      productName: products.name,
      sku: variants.sku,
      quantity: inventory.quantity,
      imageUrl: sql<string>`(
        SELECT url 
        FROM product_images 
        WHERE product_id = ${products.id} 
        ORDER BY position ASC 
        LIMIT 1
      )`,
    })
    .from(inventory)
    .innerJoin(variants, eq(inventory.variantId, variants.id))
    .innerJoin(products, eq(variants.productId, products.id))
    .where(
      and(
        sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`,
        isNull(variants.deletedAt)
      )
    )
    .orderBy(asc(inventory.quantity))
    .limit(5)
}

export const getLowStockAlert = unstable_cache(
  _getLowStockAlert,
  ["dashboard-low-stock"],
  { tags: ["dashboard", "inventory"], revalidate: DASHBOARD_CACHE_TTL }
)

// ── New Analytics Queries ──────────────────────────────────────────────

const _getConversionRate = async () => {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [thisWeekSessions] = await db
    .select({ count: sql<number>`count(distinct ${userSessions.id})` })
    .from(userSessions)
    .where(gte(userSessions.startedAt, sevenDaysAgo))

  const [lastWeekSessions] = await db
    .select({ count: sql<number>`count(distinct ${userSessions.id})` })
    .from(userSessions)
    .where(and(gte(userSessions.startedAt, fourteenDaysAgo), lt(userSessions.startedAt, sevenDaysAgo)))

  const [thisWeekOrders] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(gte(orders.createdAt, sevenDaysAgo), isNull(orders.deletedAt)))

  const [lastWeekOrders] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(gte(orders.createdAt, fourteenDaysAgo), lt(orders.createdAt, sevenDaysAgo), isNull(orders.deletedAt)))

  const thisWeekSessionCount = Number(thisWeekSessions?.count ?? 0)
  const lastWeekSessionCount = Number(lastWeekSessions?.count ?? 0)
  const thisWeekOrderCount = Number(thisWeekOrders?.count ?? 0)
  const lastWeekOrderCount = Number(lastWeekOrders?.count ?? 0)

  const thisRate = thisWeekSessionCount > 0 ? (thisWeekOrderCount / thisWeekSessionCount) * 100 : 0
  const lastRate = lastWeekSessionCount > 0 ? (lastWeekOrderCount / lastWeekSessionCount) * 100 : 0

  return {
    value: thisRate,
    change: calculatePercentChange(thisRate, lastRate),
    isPositive: thisRate >= lastRate,
  }
}

export const getConversionRate = unstable_cache(
  _getConversionRate,
  ["dashboard-conversion-rate"],
  { tags: ["dashboard"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getSessionsByDevice = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const rows = await db
    .select({
      device: userSessions.deviceType,
      count: sql<number>`count(*)`,
    })
    .from(userSessions)
    .where(gte(userSessions.startedAt, sevenDaysAgo))
    .groupBy(userSessions.deviceType)

  const total = rows.reduce((sum, r) => sum + Number(r.count), 0)

  return {
    data: rows.map((r) => ({
      label: r.device.charAt(0) + r.device.slice(1).toLowerCase(),
      value: Number(r.count),
      percentage: total > 0 ? Number(((Number(r.count) / total) * 100).toFixed(1)) : 0,
    })),
    total,
  }
}

export const getSessionsByDevice = unstable_cache(
  _getSessionsByDevice,
  ["dashboard-sessions-by-device"],
  { tags: ["dashboard"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getRevenueByCategory = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const rows = await db
    .select({
      categoryName: categories.name,
      revenue: sql<number>`sum(${orderItems.totalPrice})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(variants, eq(orderItems.variantId, variants.id))
    .leftJoin(products, eq(variants.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(gte(orders.createdAt, sevenDaysAgo), isNull(orders.deletedAt)))
    .groupBy(categories.id, categories.name)
    .orderBy(desc(sql`sum(${orderItems.totalPrice})`))
    .limit(6)

  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.revenue), 0)

  return rows.map((r) => ({
    name: r.categoryName || "Uncategorized",
    revenue: Number(r.revenue),
    percentage: totalRevenue > 0 ? Number(((Number(r.revenue) / totalRevenue) * 100).toFixed(1)) : 0,
  }))
}

export const getRevenueByCategory = unstable_cache(
  _getRevenueByCategory,
  ["dashboard-revenue-by-category"],
  { tags: ["dashboard"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getNewVsReturningCustomers = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const sevenDaysAgoISO = sevenDaysAgo.toISOString()

  // New: users whose first order is within this 7-day window
  const [newResult] = await db
    .select({ count: sql<number>`count(distinct ${orders.userId})` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, sevenDaysAgo),
        isNull(orders.deletedAt),
        sql`${orders.userId} NOT IN (
          SELECT DISTINCT user_id FROM orders
          WHERE created_at < ${sevenDaysAgoISO}::timestamptz AND deleted_at IS NULL
        )`
      )
    )

  // Returning: users who ordered this week AND had a previous order
  const [returningResult] = await db
    .select({ count: sql<number>`count(distinct ${orders.userId})` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, sevenDaysAgo),
        isNull(orders.deletedAt),
        sql`${orders.userId} IN (
          SELECT DISTINCT user_id FROM orders
          WHERE created_at < ${sevenDaysAgoISO}::timestamptz AND deleted_at IS NULL
        )`
      )
    )

  const newCount = Number(newResult?.count ?? 0)
  const returningCount = Number(returningResult?.count ?? 0)
  const total = newCount + returningCount

  return {
    newCustomers: newCount,
    returningCustomers: returningCount,
    total,
    newPercentage: total > 0 ? Number(((newCount / total) * 100).toFixed(1)) : 0,
    returningPercentage: total > 0 ? Number(((returningCount / total) * 100).toFixed(1)) : 0,
  }
}

export const getNewVsReturningCustomers = unstable_cache(
  _getNewVsReturningCustomers,
  ["dashboard-new-vs-returning"],
  { tags: ["dashboard"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getSalesHeatmap = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const rows = await db
    .select({
      dayOfWeek: sql<number>`extract(dow from ${orders.createdAt})`,
      hourOfDay: sql<number>`extract(hour from ${orders.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, sevenDaysAgo), isNull(orders.deletedAt)))
    .groupBy(sql`extract(dow from ${orders.createdAt})`, sql`extract(hour from ${orders.createdAt})`)

  // Build a 7×24 matrix (0=Sun..6=Sat)
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  for (const row of rows) {
    const day = Number(row.dayOfWeek)
    const hour = Number(row.hourOfDay)
    heatmap[day][hour] = Number(row.count)
  }

  return heatmap
}

export const getSalesHeatmap = unstable_cache(
  _getSalesHeatmap,
  ["dashboard-sales-heatmap"],
  { tags: ["dashboard"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getTopReferrers = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const rows = await db
    .select({
      referrer: sql<string>`
        CASE
          WHEN ${userEvents.referrer} IS NULL OR ${userEvents.referrer} = '' THEN 'Direct'
          ELSE regexp_replace(${userEvents.referrer}, '^https?://([^/]+).*$', '\\1')
        END
      `,
      sessions: sql<number>`count(distinct ${userEvents.sessionId})`,
      orders: sql<number>`count(distinct CASE WHEN ${userEvents.eventType} = 'ORDER_COMPLETE' THEN ${userEvents.orderId} END)`,
    })
    .from(userEvents)
    .where(gte(userEvents.createdAt, sevenDaysAgo))
    .groupBy(sql`
      CASE
        WHEN ${userEvents.referrer} IS NULL OR ${userEvents.referrer} = '' THEN 'Direct'
        ELSE regexp_replace(${userEvents.referrer}, '^https?://([^/]+).*$', '\\1')
      END
    `)
    .orderBy(desc(sql`count(distinct ${userEvents.sessionId})`))
    .limit(5)

  return rows.map((r) => ({
    source: r.referrer,
    sessions: Number(r.sessions),
    orders: Number(r.orders),
    conversionRate: Number(r.sessions) > 0 ? Number(((Number(r.orders) / Number(r.sessions)) * 100).toFixed(2)) : 0,
  }))
}

export const getTopReferrers = unstable_cache(
  _getTopReferrers,
  ["dashboard-top-referrers"],
  { tags: ["dashboard"], revalidate: DASHBOARD_CACHE_TTL }
)

const _getConversionFunnel = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const stages = [
    { name: "Sessions", eventType: "PAGE_VIEW" },
    { name: "Product Views", eventType: "PRODUCT_VIEW" },
    { name: "Add to Cart", eventType: "CART_ADD" },
    { name: "Checkout Started", eventType: "CHECKOUT_START" },
    { name: "Orders Placed", eventType: "ORDER_COMPLETE" },
  ]

  // Run all 5 stage queries in parallel instead of a serial for-loop
  const results = await Promise.all(
    stages.map(async (stage) => {
      const [result] = await db
        .select({ count: sql<number>`count(distinct ${userEvents.sessionId})` })
        .from(userEvents)
        .where(and(
          gte(userEvents.createdAt, sevenDaysAgo),
          eq(userEvents.eventType, stage.eventType)
        ))
      return { name: stage.name, value: Number(result?.count ?? 0) }
    })
  )

  const topValue = results[0]?.value || 1
  return results.map((r) => ({
    ...r,
    percentage: Number(((r.value / topValue) * 100).toFixed(1)),
  }))
}

export const getConversionFunnel = unstable_cache(
  _getConversionFunnel,
  ["dashboard-conversion-funnel"],
  { tags: ["dashboard"], revalidate: DASHBOARD_CACHE_TTL }
)

// ════════════════════════════════════════════════════════════════════════════
// ANALYTICS TAB QUERIES — Date-bounded, all use unstable_cache with date-range
// in the cache key so different date ranges never share the same cached result.
//
// Default range: 30 days. All queries have bounded WHERE clauses.
// Raw events explorer: NOT cached (always live, paginated).
// ════════════════════════════════════════════════════════════════════════════

/**
 * Revenue by day — bounded date range for the Revenue tab chart.
 * Source of truth: orders table. Analytics events are behavioral only.
 */
const _getRevenueByDay = async (startISO: string, endISO: string) => {
  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${orders.createdAt})::date::text`,
      gross: sql<number>`coalesce(sum(${orders.total}), 0)`,
      net: sql<number>`coalesce(sum(${orders.total} - ${orders.discountAmount}), 0)`,
      orderCount: sql<number>`count(*)`,
      aov: sql<number>`coalesce(avg(${orders.total}), 0)`,
    })
    .from(orders)
    .where(and(
      gte(orders.createdAt, new Date(startISO)),
      lte(orders.createdAt, new Date(endISO)),
      isNull(orders.deletedAt),
    ))
    .groupBy(sql`date_trunc('day', ${orders.createdAt})::date`)
    .orderBy(sql`date_trunc('day', ${orders.createdAt})::date`)

  return rows.map((r) => ({
    day: r.day,
    gross: Number(r.gross),
    net: Number(r.net),
    orderCount: Number(r.orderCount),
    aov: Number(r.aov),
  }))
}

export const getRevenueByDay = (startISO: string, endISO: string) =>
  unstable_cache(
    () => _getRevenueByDay(startISO, endISO),
    ["analytics-revenue-day", startISO, endISO],
    { tags: ["dashboard", "orders"], revalidate: DASHBOARD_CACHE_TTL }
  )()

/**
 * Revenue summary — totals for the selected period vs previous period.
 */
const _getRevenueSummary = async (startISO: string, endISO: string) => {
  const start = new Date(startISO)
  const end = new Date(endISO)
  const rangeMs = end.getTime() - start.getTime()
  const prevStart = new Date(start.getTime() - rangeMs)

  const [curr] = await db
    .select({
      gross: sql<number>`coalesce(sum(${orders.total}), 0)`,
      net: sql<number>`coalesce(sum(${orders.total} - ${orders.discountAmount}), 0)`,
      orderCount: sql<number>`count(*)`,
      aov: sql<number>`coalesce(avg(${orders.total}), 0)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, start), lte(orders.createdAt, end), isNull(orders.deletedAt)))

  const [prev] = await db
    .select({
      gross: sql<number>`coalesce(sum(${orders.total}), 0)`,
      orderCount: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, prevStart), lt(orders.createdAt, start), isNull(orders.deletedAt)))

  return {
    gross: Number(curr.gross),
    net: Number(curr.net),
    orderCount: Number(curr.orderCount),
    aov: Number(curr.aov),
    prevGross: Number(prev.gross),
    prevOrderCount: Number(prev.orderCount),
    grossChange: calculatePercentChange(Number(curr.gross), Number(prev.gross)),
    orderCountChange: calculatePercentChange(Number(curr.orderCount), Number(prev.orderCount)),
  }
}

export const getRevenueSummary = (startISO: string, endISO: string) =>
  unstable_cache(
    () => _getRevenueSummary(startISO, endISO),
    ["analytics-revenue-summary", startISO, endISO],
    { tags: ["dashboard", "orders"], revalidate: DASHBOARD_CACHE_TTL }
  )()

/**
 * Session & visitor summary — uses user_sessions.anonymous_id (migration 0014).
 * Computes: sessions, anonymous visitors, authenticated customers,
 * returning visitors (seen before range), new visitors (first session in range).
 */
const _getSessionSummary = async (startISO: string, endISO: string) => {
  const start = new Date(startISO)
  const end = new Date(endISO)

  // Single query for sessions, unique anonymous visitors, and authenticated customers
  const [[summaryRow], [returningRow]] = await Promise.all([
    db
      .select({
        sessions: sql<number>`count(*)`,
        anon: sql<number>`count(distinct ${userSessions.anonymousId})`,
        customers: sql<number>`count(distinct ${userSessions.userId})`,
      })
      .from(userSessions)
      .where(and(gte(userSessions.startedAt, start), lte(userSessions.startedAt, end))),
    // Returning visitors: anonymousId has at least one session BEFORE the start date
    db
      .select({ returning: sql<number>`count(distinct s.anonymous_id)` })
      .from(sql`user_sessions s`)
      .where(sql`
        s.started_at BETWEEN ${start} AND ${end}
        AND s.anonymous_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM user_sessions prev
          WHERE prev.anonymous_id = s.anonymous_id
            AND prev.started_at < ${start}
        )
      `),
  ])

  const sessions = Number(summaryRow?.sessions ?? 0)
  const anonVisitors = Number(summaryRow?.anon ?? 0)
  const customers = Number(summaryRow?.customers ?? 0)
  const returning = Number(returningRow?.returning ?? 0)
  const newVisitors = Math.max(0, anonVisitors - returning)

  return { sessions, anonVisitors, customers, returning, newVisitors }
}

export const getSessionSummary = (startISO: string, endISO: string) =>
  unstable_cache(
    () => _getSessionSummary(startISO, endISO),
    ["analytics-session-summary", startISO, endISO],
    { tags: ["dashboard", "sessions"], revalidate: DASHBOARD_CACHE_TTL }
  )()

/**
 * UTM attribution — GROUP BY utm_source for the Traffic tab.
 */
const _getUTMAttribution = async (startISO: string, endISO: string) => {
  const rows = await db
    .select({
      source: sql<string>`coalesce(${userSessions.utmSource}, 'Direct')`,
      medium: sql<string>`coalesce(${userSessions.utmMedium}, 'none')`,
      sessions: sql<number>`count(*)`,
    })
    .from(userSessions)
    .where(and(gte(userSessions.startedAt, new Date(startISO)), lte(userSessions.startedAt, new Date(endISO))))
    .groupBy(userSessions.utmSource, userSessions.utmMedium)
    .orderBy(desc(sql`count(*)`))
    .limit(20)

  return rows.map((r) => ({ source: r.source, medium: r.medium, sessions: Number(r.sessions) }))
}

export const getUTMAttribution = (startISO: string, endISO: string) =>
  unstable_cache(
    () => _getUTMAttribution(startISO, endISO),
    ["analytics-utm", startISO, endISO],
    { tags: ["dashboard", "sessions"], revalidate: DASHBOARD_CACHE_TTL }
  )()

/**
 * Geo breakdown — top countries for the Traffic tab.
 */
const _getGeoBreakdown = async (startISO: string, endISO: string) => {
  const rows = await db
    .select({
      country: userSessions.countryCode,
      sessions: sql<number>`count(*)`,
    })
    .from(userSessions)
    .where(and(
      gte(userSessions.startedAt, new Date(startISO)),
      lte(userSessions.startedAt, new Date(endISO)),
      isNotNull(userSessions.countryCode),
    ))
    .groupBy(userSessions.countryCode)
    .orderBy(desc(sql`count(*)`))
    .limit(30)

  return rows.map((r) => ({ country: r.country ?? "Unknown", sessions: Number(r.sessions) }))
}

export const getGeoBreakdown = (startISO: string, endISO: string) =>
  unstable_cache(
    () => _getGeoBreakdown(startISO, endISO),
    ["analytics-geo", startISO, endISO],
    { tags: ["dashboard", "sessions"], revalidate: DASHBOARD_CACHE_TTL }
  )()

/**
 * Top products by sales — ground truth from orders/order_items.
 * Does NOT use analytics events as financial source of truth.
 */
const _getProductSalesTable = async (startISO: string, endISO: string, limit = 50) => {
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      unitsSold: sql<number>`sum(${orderItems.quantity})`,
      revenue: sql<number>`sum(${orderItems.totalPrice})`,
      orderCount: sql<number>`count(distinct ${orderItems.orderId})`,
    })
    .from(orderItems)
    .innerJoin(variants, eq(orderItems.variantId, variants.id))
    .innerJoin(products, eq(variants.productId, products.id))
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(
      gte(orders.createdAt, new Date(startISO)),
      lte(orders.createdAt, new Date(endISO)),
      isNull(orders.deletedAt),
    ))
    .groupBy(products.id, products.name, products.slug)
    .orderBy(desc(sql`sum(${orderItems.totalPrice})`))
    .limit(limit)

  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    productSlug: r.productSlug,
    unitsSold: Number(r.unitsSold),
    revenue: Number(r.revenue),
    orderCount: Number(r.orderCount),
  }))
}

export const getProductSalesTable = (startISO: string, endISO: string) =>
  unstable_cache(
    () => _getProductSalesTable(startISO, endISO),
    ["analytics-products", startISO, endISO],
    { tags: ["dashboard", "orders", "products"], revalidate: DASHBOARD_CACHE_TTL }
  )()

/**
 * Collection revenue — orders attributed via product_collections JOIN.
 */
const _getCollectionRevenue = async (startISO: string, endISO: string) => {
  const rows = await db
    .select({
      collectionId: collections.id,
      collectionName: collections.name,
      collectionSlug: collections.slug,
      revenue: sql<number>`sum(${orderItems.totalPrice})`,
      unitsSold: sql<number>`sum(${orderItems.quantity})`,
      orderCount: sql<number>`count(distinct ${orderItems.orderId})`,
    })
    .from(orderItems)
    .innerJoin(variants, eq(orderItems.variantId, variants.id))
    .innerJoin(products, eq(variants.productId, products.id))
    .innerJoin(sql`product_collections pc`, sql`pc.product_id = ${products.id}`)
    .innerJoin(collections, sql`pc.collection_id = ${collections.id}`)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(
      gte(orders.createdAt, new Date(startISO)),
      lte(orders.createdAt, new Date(endISO)),
      isNull(orders.deletedAt),
      isNull(collections.deletedAt),
    ))
    .groupBy(collections.id, collections.name, collections.slug)
    .orderBy(desc(sql`sum(${orderItems.totalPrice})`))
    .limit(50)

  return rows.map((r) => ({
    collectionId: r.collectionId,
    collectionName: r.collectionName,
    collectionSlug: r.collectionSlug,
    revenue: Number(r.revenue),
    unitsSold: Number(r.unitsSold),
    orderCount: Number(r.orderCount),
  }))
}

export const getCollectionRevenue = (startISO: string, endISO: string) =>
  unstable_cache(
    () => _getCollectionRevenue(startISO, endISO),
    ["analytics-collections", startISO, endISO],
    { tags: ["dashboard", "orders", "collections"], revalidate: DASHBOARD_CACHE_TTL }
  )()

/**
 * Inventory with back-in-stock demand.
 * Shows stock status alongside pending BIS requests for demand signals.
 */
const _getInventoryWithDemand = async () => {
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      sku: variants.sku,
      variantId: variants.id,
      quantity: inventory.quantity,
      reserved: inventory.reserved,
      status: inventory.status,
      pendingDemand: sql<number>`coalesce(bis.demand, 0)`,
    })
    .from(inventory)
    .innerJoin(variants, eq(inventory.variantId, variants.id))
    .innerJoin(products, eq(variants.productId, products.id))
    .leftJoin(
      sql`(
        SELECT product_id, count(*) as demand
        FROM back_in_stock_requests
        WHERE notified = false
        GROUP BY product_id
      ) bis`,
      sql`bis.product_id = ${products.id}`
    )
    .orderBy(desc(sql`coalesce(bis.demand, 0)`), asc(inventory.quantity))
    .limit(100)

  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    productSlug: r.productSlug,
    sku: r.sku,
    variantId: r.variantId,
    quantity: r.quantity,
    reserved: r.reserved,
    status: r.status,
    pendingDemand: Number(r.pendingDemand),
  }))
}

export const getInventoryWithDemand = unstable_cache(
  _getInventoryWithDemand,
  ["analytics-inventory"],
  { tags: ["dashboard", "inventory"], revalidate: DASHBOARD_CACHE_TTL }
)

/**
 * Top search queries — requires Phase 4 SEARCH events to be wired.
 * Returns empty array until data accumulates.
 */
const _getTopSearchQueries = async (startISO: string, endISO: string) => {
  const rows = await db
    .select({
      query: searchQueries.query,
      searches: sql<number>`count(*)`,
      zeroResults: sql<number>`count(*) filter (where ${searchQueries.resultsCount} = 0)`,
    })
    .from(searchQueries)
    .where(and(
      gte(searchQueries.createdAt, new Date(startISO)),
      lte(searchQueries.createdAt, new Date(endISO)),
    ))
    .groupBy(searchQueries.query)
    .orderBy(desc(sql`count(*)`))
    .limit(50)

  return rows.map((r) => ({
    query: r.query,
    searches: Number(r.searches),
    zeroResults: Number(r.zeroResults),
  }))
}

export const getTopSearchQueries = (startISO: string, endISO: string) =>
  unstable_cache(
    () => _getTopSearchQueries(startISO, endISO),
    ["analytics-search", startISO, endISO],
    { tags: ["dashboard", "search"], revalidate: DASHBOARD_CACHE_TTL }
  )()

/**
 * Customer value distribution — for the Customers tab.
 * Uses customer_metrics (pre-aggregated, fast) plus sessions for visitor counts.
 */
const _getCustomerValueDistribution = async () => {
  const [totals] = await db
    .select({
      totalCustomers: sql<number>`count(*)`,
      avgLtv: sql<number>`coalesce(avg(${customerMetrics.lifetimeSpend}), 0)`,
      avgOrders: sql<number>`coalesce(avg(${customerMetrics.totalOrders}), 0)`,
      avgAov: sql<number>`coalesce(avg(${customerMetrics.averageOrderValue}), 0)`,
      repeatCustomers: sql<number>`count(*) filter (where ${customerMetrics.totalOrders} > 1)`,
    })
    .from(customerMetrics)

  return {
    totalCustomers: Number(totals.totalCustomers),
    avgLtv: Number(totals.avgLtv),
    avgOrders: Number(totals.avgOrders),
    avgAov: Number(totals.avgAov),
    repeatCustomers: Number(totals.repeatCustomers),
    repeatRate: Number(totals.totalCustomers) > 0
      ? Number(((Number(totals.repeatCustomers) / Number(totals.totalCustomers)) * 100).toFixed(1))
      : 0,
  }
}

export const getCustomerValueDistribution = unstable_cache(
  _getCustomerValueDistribution,
  ["analytics-customer-distribution"],
  { tags: ["dashboard", "customers"], revalidate: DASHBOARD_CACHE_TTL }
)

/**
 * Paginated raw events explorer — NOT cached (always live).
 * Payload is returned but UI should collapse it by default.
 * Sensitive fields are NOT exposed here; masking happens in the UI component.
 */
export async function getPaginatedEvents({
  startISO,
  endISO,
  eventType,
  productId,
  page = 1,
  pageSize = 50,
}: {
  startISO: string
  endISO: string
  eventType?: string | null
  productId?: string | null
  page?: number
  pageSize?: number
}) {
  const offset = (page - 1) * pageSize
  const conditions = [
    gte(userEvents.createdAt, new Date(startISO)),
    lte(userEvents.createdAt, new Date(endISO)),
    ...(eventType ? [eq(userEvents.eventType, eventType)] : []),
    ...(productId ? [eq(userEvents.productId, productId)] : []),
  ]

  const [rows, [countRow]] = await Promise.all([
    db
      .select({
        id: userEvents.id,
        eventType: userEvents.eventType,
        page: userEvents.page,
        device: userEvents.device,
        country: userEvents.country,
        productId: userEvents.productId,
        collectionId: userEvents.collectionId,
        variantId: userEvents.variantId,
        orderId: userEvents.orderId,
        sessionId: userEvents.sessionId,
        userId: userEvents.userId,
        createdAt: userEvents.createdAt,
        // Payload included for row-expand; UI must collapse it by default
        payload: userEvents.payload,
      })
      .from(userEvents)
      .where(and(...conditions))
      .orderBy(desc(userEvents.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)` })
      .from(userEvents)
      .where(and(...conditions)),
  ])

  return {
    rows,
    total: Number(countRow.total),
    page,
    pageSize,
    totalPages: Math.ceil(Number(countRow.total) / pageSize),
  }
}
