"use server"

import { db } from "@/db/client"
import { users } from "@/db/schema/users"
import { orders } from "@/db/schema/orders"
import { SessionService } from "@/services/session.service"
import { eq, sql, and, isNull, ilike, or, desc } from "drizzle-orm"
import type { ActionResult } from "@/types/actions"

export async function getCustomersAction(options: {
  page?: number
  limit?: number
  search?: string
}) {
  try {
    await SessionService.requireAdmin()

    const page = options.page || 1
    const limit = options.limit || 20
    const offset = (page - 1) * limit

    const conditions: any[] = [isNull(users.deletedAt)]

    if (options.search) {
      const searchPattern = `%${options.search.trim()}%`
      conditions.push(
        or(
          ilike(users.email, searchPattern),
          ilike(sql`concat(${users.firstName}, ' ', ${users.lastName})`, searchPattern)
        )
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Query paginated users with order count and lifetime spend computed directly from orders
    const items = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
        totalOrders: sql<number>`coalesce(count(${orders.id}) filter (where ${orders.deletedAt} is null and ${orders.status} not in ('CANCELLED', 'PENDING_PAYMENT')), 0)::int`,
        lifetimeSpend: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.deletedAt} is null and ${orders.status} not in ('CANCELLED', 'PENDING_PAYMENT')), 0)::int`
      })
      .from(users)
      .leftJoin(orders, eq(orders.userId, users.id))
      .where(whereClause)
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset)

    // Query total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(distinct ${users.id})` })
      .from(users)
      .leftJoin(orders, eq(orders.userId, users.id))
      .where(whereClause)

    const totalCount = Number(totalCountResult[0]?.count ?? 0)

    return {
      success: true,
      data: {
        items,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      }
    }
  } catch (error: any) {
    console.error("[getCustomersAction Error]:", error)
    return {
      success: false,
      error: {
        code: "GET_CUSTOMERS_ERROR",
        message: error.message || "Failed to fetch customers.",
      }
    }
  }
}
