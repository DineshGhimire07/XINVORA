import { eq, and, desc, sql, ilike, or, isNull, lt, inArray } from "drizzle-orm"
import { db } from "../client"
import { orders, orderItems, users } from "../schema"

export async function findOrderById(id: string) {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1)
  return result[0] ?? null
}

export async function findOrderByNumber(userId: string, orderNumber: string) {
  const result = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.orderNumber, orderNumber)
      )
    )
    .limit(1)
  
  if (result.length === 0) return null
  const order = result[0]

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))

  return {
    ...order,
    items,
  }
}

export async function findUserOrdersPaginated(
  userId: string,
  options: {
    page?: number
    limit?: number
    search?: string
    status?: string | string[]
    sortBy?: "createdAt" | "total"
    sortOrder?: "asc" | "desc"
  } = {}
) {
  const page = options.page || 1
  const limit = options.limit || 10
  const offset = (page - 1) * limit

  const conditions: any[] = [eq(orders.userId, userId)]

  if (options.status) {
    if (Array.isArray(options.status)) {
      conditions.push(inArray(orders.status, options.status as any))
    } else {
      conditions.push(eq(orders.status, options.status as any))
    }
  }

  if (options.search) {
    conditions.push(
      or(
        ilike(orders.orderNumber, `%${options.search}%`),
        ilike(orders.shippingMethod, `%${options.search}%`)
      )
    )
  }

  // Sort settings
  const sortCol = options.sortBy === "total" ? orders.total : orders.createdAt
  const orderDirection = options.sortOrder === "asc" ? sortCol : desc(sortCol)

  const [items, countResult] = await Promise.all([
    db.query.orders.findMany({
      where: and(...conditions),
      orderBy: orderDirection,
      limit: limit,
      offset: offset,
      with: {
        orderItems: true
      }
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
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

export async function findAdminOrdersPaginated(
  options: {
    page?: number
    limit?: number
    search?: string
    status?: string | string[]
    sortBy?: "createdAt" | "total"
    sortOrder?: "asc" | "desc"
  } = {}
) {
  const page = options.page || 1
  const limit = options.limit || 10
  const offset = (page - 1) * limit

  const conditions: any[] = [isNull(orders.deletedAt)]

  if (options.status) {
    if (Array.isArray(options.status)) {
      conditions.push(inArray(orders.status, options.status as any))
    } else {
      conditions.push(eq(orders.status, options.status as any))
    }
  }

  if (options.search) {
    conditions.push(
      or(
        ilike(orders.orderNumber, `%${options.search}%`),
        ilike(users.email, `%${options.search}%`),
        ilike(sql`concat(${users.firstName}, ' ', ${users.lastName})`, `%${options.search}%`)
      )
    )
  }

  const baseQuery = db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      total: orders.total,
      createdAt: orders.createdAt,
      customerName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
      customerEmail: users.email,
      itemCount: sql<number>`coalesce((select sum(${orderItems.quantity}) from ${orderItems} where ${orderItems.orderId} = ${orders.id}), 0)`,
      imageUrl: sql<string>`(
        SELECT pi.url
        FROM product_images pi
        JOIN variants v ON v.product_id = pi.product_id
        JOIN order_items oi ON oi.variant_id = v.id
        WHERE oi.order_id = orders.id
        ORDER BY pi.position ASC
        LIMIT 1
      )`,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(and(...conditions))

  // Sort settings
  const sortCol = options.sortBy === "total" ? orders.total : orders.createdAt
  const orderDirection = options.sortOrder === "asc" ? sortCol : desc(sortCol)

  const [items, countResult] = await Promise.all([
    baseQuery
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
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

export async function findAdminOrderDetailsById(orderId: string) {
  // Fetch the order with joined customer details
  const orderResult = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      invoiceNumber: orders.invoiceNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      shippingAddress: orders.shippingAddress,
      billingAddress: orders.billingAddress,
      subtotal: orders.subtotal,
      shippingCost: orders.shippingCost,
      taxAmount: orders.taxAmount,
      discountAmount: orders.discountAmount,
      total: orders.total,
      currency: orders.currency,
      notes: orders.notes,
      createdAt: orders.createdAt,
      customerName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
      customerEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(and(eq(orders.id, orderId), isNull(orders.deletedAt)))
    .limit(1)

  if (orderResult.length === 0) return null
  const order = orderResult[0]

  // Fetch the items for this order
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))

  // Fetch the activities for this order
  const { orderActivity } = await import("../schema/order-activity")
  const activities = await db
    .select({
      id: orderActivity.id,
      action: orderActivity.action,
      oldStatus: orderActivity.oldStatus,
      newStatus: orderActivity.newStatus,
      createdAt: orderActivity.createdAt,
      performedByName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(orderActivity)
    .leftJoin(users, eq(orderActivity.performedBy, users.id))
    .where(eq(orderActivity.orderId, order.id))
    .orderBy(desc(orderActivity.createdAt))

  return {
    ...order,
    items,
    activities,
  }
}

export async function findRecentOrdersWithItems(userId: string, limit: number = 3) {
  return await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: desc(orders.createdAt),
    limit: limit,
    with: {
      orderItems: {
        with: {
          variant: {
            with: {
              product: {
                with: {
                  productImages: true
                }
              }
            }
          }
        }
      }
    }
  })
}
