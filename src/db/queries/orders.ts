import { eq, and, desc, sql, ilike, or } from "drizzle-orm"
import { db } from "../client"
import { orders, orderItems } from "../schema"

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
    status?: string
    sortBy?: "createdAt" | "total"
    sortOrder?: "asc" | "desc"
  } = {}
) {
  const page = options.page || 1
  const limit = options.limit || 10
  const offset = (page - 1) * limit

  const conditions: any[] = [eq(orders.userId, userId)]

  if (options.status) {
    conditions.push(eq(orders.status, options.status as any))
  }

  if (options.search) {
    conditions.push(
      or(
        ilike(orders.orderNumber, `%${options.search}%`),
        ilike(orders.shippingMethod, `%${options.search}%`)
      )
    )
  }

  const baseQuery = db
    .select()
    .from(orders)
    .where(and(...conditions))

  // Sort settings
  const sortCol = options.sortBy === "total" ? orders.total : orders.createdAt
  const orderDirection = options.sortOrder === "asc" ? sortCol : desc(sortCol)

  const items = await baseQuery
    .orderBy(orderDirection)
    .limit(limit)
    .offset(offset)

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(...conditions))
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
    status?: string
    sortBy?: "createdAt" | "total"
    sortOrder?: "asc" | "desc"
  } = {}
) {
  const page = options.page || 1
  const limit = options.limit || 10
  const offset = (page - 1) * limit

  const conditions: any[] = []

  if (options.status) {
    conditions.push(eq(orders.status, options.status as any))
  }

  if (options.search) {
    conditions.push(
      or(
        ilike(orders.orderNumber, `%${options.search}%`),
        ilike(orders.shippingMethod, `%${options.search}%`)
      )
    )
  }

  const baseQuery = db
    .select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  // Sort settings
  const sortCol = options.sortBy === "total" ? orders.total : orders.createdAt
  const orderDirection = options.sortOrder === "asc" ? sortCol : desc(sortCol)

  const items = await baseQuery
    .orderBy(orderDirection)
    .limit(limit)
    .offset(offset)

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
  const total = Number(countResult[0]?.count ?? 0)

  return {
    items,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}
