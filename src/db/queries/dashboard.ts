import "server-only"
import { eq, and, desc, asc, sql, gte, lt, isNull } from "drizzle-orm"
import { db } from "../client"
import { orders, orderItems, users, products, variants, inventory, categories, userSessions, userEvents } from "../schema"

function calculatePercentChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%"
  }
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? "+" : ""
  return `${sign}${change.toFixed(1)}%`
}

export async function getDashboardStats() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // 1. Fetch orders stats
  const [thisWeekOrdersResult] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, sevenDaysAgo), isNull(orders.deletedAt)))

  const [lastWeekOrdersResult] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, fourteenDaysAgo), lt(orders.createdAt, sevenDaysAgo), isNull(orders.deletedAt)))

  const thisWeekRevenue = Number(thisWeekOrdersResult?.revenue ?? 0)
  const thisWeekOrdersCount = Number(thisWeekOrdersResult?.count ?? 0)
  const lastWeekRevenue = Number(lastWeekOrdersResult?.revenue ?? 0)
  const lastWeekOrdersCount = Number(lastWeekOrdersResult?.count ?? 0)

  // 2. Fetch customer stats (cumulative)
  const [thisWeekCustomersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.role, "CUSTOMER"), isNull(users.deletedAt), lt(users.createdAt, now)))

  const [lastWeekCustomersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.role, "CUSTOMER"), isNull(users.deletedAt), lt(users.createdAt, sevenDaysAgo)))

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

export async function getSalesOverviewChart() {
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

export async function getRecentOrders() {
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

export async function getTopProducts() {
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

export async function getOrdersByStatus() {
  return await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(isNull(orders.deletedAt))
    .groupBy(orders.status)
}

export async function getLowStockAlert() {
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

// ── New Analytics Queries ──────────────────────────────────────────────

export async function getConversionRate() {
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

export async function getSessionsByDevice() {
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

export async function getRevenueByCategory() {
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

export async function getNewVsReturningCustomers() {
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

export async function getSalesHeatmap() {
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

export async function getTopReferrers() {
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

export async function getConversionFunnel() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const stages = [
    { name: "Sessions", eventType: "PAGE_VIEW" },
    { name: "Product Views", eventType: "PRODUCT_VIEW" },
    { name: "Add to Cart", eventType: "CART_ADD" },
    { name: "Checkout Started", eventType: "CHECKOUT_START" },
    { name: "Orders Placed", eventType: "ORDER_COMPLETE" },
  ]

  const results = []
  for (const stage of stages) {
    const [result] = await db
      .select({ count: sql<number>`count(distinct ${userEvents.sessionId})` })
      .from(userEvents)
      .where(and(
        gte(userEvents.createdAt, sevenDaysAgo),
        eq(userEvents.eventType, stage.eventType)
      ))

    results.push({
      name: stage.name,
      value: Number(result?.count ?? 0),
    })
  }

  const topValue = results[0]?.value || 1
  return results.map((r) => ({
    ...r,
    percentage: Number(((r.value / topValue) * 100).toFixed(1)),
  }))
}
