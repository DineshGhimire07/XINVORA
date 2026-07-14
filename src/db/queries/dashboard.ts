import "server-only"
import { eq, and, desc, asc, sql, gte, lt, isNull } from "drizzle-orm"
import { db } from "../client"
import { orders, orderItems, users, products, variants, inventory } from "../schema"

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
