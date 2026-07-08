import { db } from "@/db/client"
import { customerMetrics, userSessions, userEvents, orders, categories } from "@/db/schema"
import { eq, and, notInArray, sql, desc } from "drizzle-orm"

export class CustomerAnalyticsService {
  /**
   * Recalculates and updates cached customer_metrics for a specific user
   * by running comprehensive transactional aggregations.
   */
  public static async reconcileCustomerMetrics(userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Recalculate lifetime spend, total orders, and AOV from the actual orders table
      const completedOrders = await tx
        .select({
          count: sql<number>`count(*)::int`,
          spend: sql<string>`coalesce(sum(${orders.total}), 0)::text`,
          lastPurchase: sql<Date | null>`max(${orders.createdAt})`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.userId, userId),
            notInArray(orders.status, ["CANCELLED", "PENDING_PAYMENT"])
          )
        )

      const orderCount = completedOrders[0]?.count || 0
      const lifetimeSpend = BigInt(completedOrders[0]?.spend || "0")
      const aov = orderCount > 0 ? lifetimeSpend / BigInt(orderCount) : BigInt(0)
      const lastPurchaseAt = completedOrders[0]?.lastPurchase || null

      // 2. Recalculate sessions metrics from user_sessions
      const sessions = await tx
        .select({
          count: sql<number>`count(*)::int`,
          avgDuration: sql<number>`coalesce(avg(extract(epoch from (${userSessions.lastActivityAt} - ${userSessions.startedAt}))), 0)::int`,
          lastVisit: sql<Date | null>`max(${userSessions.lastActivityAt})`,
        })
        .from(userSessions)
        .where(eq(userSessions.userId, userId))

      const sessionCount = sessions[0]?.count || 0
      const averageSessionDuration = sessions[0]?.avgDuration || 0
      const lastVisitAt = sessions[0]?.lastVisit || null

      // 3. Find favorite category based on view events
      const favCategoryQuery = await tx
        .select({
          categoryId: userEvents.categoryId,
          count: sql<number>`count(*)::int`,
        })
        .from(userEvents)
        .where(
          and(
            eq(userEvents.userId, userId),
            sql`${userEvents.categoryId} is not null`
          )
        )
        .groupBy(userEvents.categoryId)
        .orderBy(desc(sql`count(*)`))
        .limit(1)

      let favoriteCategory: string | null = null
      if (favCategoryQuery[0]?.categoryId) {
        const cat = await tx.query.categories.findFirst({
          where: eq(categories.id, favCategoryQuery[0].categoryId),
        })
        if (cat) {
          favoriteCategory = cat.name
        }
      }

      // 4. Find favorite brand based on event payload brand name
      const favBrandQuery = await tx
        .select({
          brand: sql<string>`(${userEvents.payload}->>'brandName')::text`,
          count: sql<number>`count(*)::int`,
        })
        .from(userEvents)
        .where(
          and(
            eq(userEvents.userId, userId),
            sql`(${userEvents.payload}->>'brandName') is not null`
          )
        )
        .groupBy(sql`(${userEvents.payload}->>'brandName')`)
        .orderBy(desc(sql`count(*)`))
        .limit(1)

      const favoriteBrand = favBrandQuery[0]?.brand || null

      // 5. Update customer_metrics cache row
      let metrics = await tx.query.customerMetrics.findFirst({
        where: eq(customerMetrics.userId, userId),
      })

      const values = {
        lifetimeSpend,
        totalOrders: orderCount,
        averageOrderValue: aov,
        sessionCount,
        averageSessionDuration,
        lastPurchaseAt,
        lastVisitAt,
        favoriteCategory,
        favoriteBrand,
        updatedAt: new Date(),
      }

      if (!metrics) {
        await tx.insert(customerMetrics).values({
          userId,
          ...values,
        })
      } else {
        await tx
          .update(customerMetrics)
          .set(values)
          .where(eq(customerMetrics.userId, userId))
      }
    })
  }

  /**
   * Runs nightly metrics reconciliation for ALL users in the system to resolve drift
   */
  public static async reconcileAllCustomers(): Promise<{ succeeded: number; failed: number }> {
    const usersList = await db.query.users.findMany({
      columns: { id: true },
    })

    let succeeded = 0
    let failed = 0

    console.log(`Starting nightly customer metrics reconciliation for ${usersList.length} users...`)

    for (const u of usersList) {
      try {
        await this.reconcileCustomerMetrics(u.id)
        succeeded++
      } catch (err) {
        console.error(`Reconciliation failed for user ${u.id}:`, err)
        failed++
      }
    }

    console.log(`Reconciliation finished: ${succeeded} succeeded, ${failed} failed.`)
    return { succeeded, failed }
  }
}
