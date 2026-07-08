"use server"

import { db } from "@/db/client"
import { customerMetrics, users, profiles, customerTimeline, userSessions, userEvents, analyticsDlq } from "@/db/schema"
import { eq, and, or, ilike, sql, desc, asc, gte } from "drizzle-orm"
import { auth } from "@/auth"

export async function getCdpCustomersAction(params: {
  search?: string
  limit?: number
  offset?: number
  sortKey?: string
  sortOrder?: "asc" | "desc"
}) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized access to Customer Intelligence")
  }

  const limit = params.limit ?? 25
  const offset = params.offset ?? 0
  const search = params.search ?? ""
  const sortKey = params.sortKey ?? "lifetimeSpend"
  const sortOrder = params.sortOrder ?? "desc"

  // Base query construction
  const query = db
    .select({
      userId: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      lifetimeSpend: customerMetrics.lifetimeSpend,
      currency: customerMetrics.currency,
      totalOrders: customerMetrics.totalOrders,
      averageOrderValue: customerMetrics.averageOrderValue,
      sessionCount: customerMetrics.sessionCount,
      lastVisitAt: customerMetrics.lastVisitAt,
      customerTier: profiles.customerTier,
      riskScore: profiles.riskScore,
      fraudFlag: profiles.fraudFlag,
    })
    .from(users)
    .innerJoin(customerMetrics, eq(customerMetrics.userId, users.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))

  // Apply search filters if provided
  let whereClause = undefined
  if (search) {
    whereClause = or(
      ilike(users.email, `%${search}%`),
      ilike(users.firstName, `%${search}%`),
      ilike(users.lastName, `%${search}%`)
    )
  }

  // Count total matching rows for pagination
  let totalCountQuery = db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .innerJoin(customerMetrics, eq(customerMetrics.userId, users.id))
  
  if (whereClause) {
    totalCountQuery = totalCountQuery.where(whereClause) as any
  }
  const [totalCountResult] = await totalCountQuery
  const total = totalCountResult?.count || 0

  // Apply filters and pagination to main query
  let finalQuery = query
  if (whereClause) {
    finalQuery = finalQuery.where(whereClause) as any
  }

  // Sort logic
  const sortMap: Record<string, any> = {
    lifetimeSpend: customerMetrics.lifetimeSpend,
    totalOrders: customerMetrics.totalOrders,
    averageOrderValue: customerMetrics.averageOrderValue,
    lastVisitAt: customerMetrics.lastVisitAt,
    riskScore: profiles.riskScore,
  }
  const sortColumn = sortMap[sortKey] || customerMetrics.lifetimeSpend
  finalQuery = finalQuery
    .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
    .limit(limit)
    .offset(offset) as any

  const data = await finalQuery

  // Recalculate summary cards based on the entire metrics table (unpaginated)
  const [summary] = await db
    .select({
      totalCustomers: sql<number>`count(*)::int`,
      totalSpend: sql<string>`coalesce(sum(${customerMetrics.lifetimeSpend}), 0)::text`,
      avgAov: sql<string>`coalesce(avg(${customerMetrics.averageOrderValue}), 0)::text`,
      totalSessions: sql<number>`coalesce(sum(${customerMetrics.sessionCount}), 0)::int`,
    })
    .from(customerMetrics)

  return {
    data: data.map(item => ({
      ...item,
      lifetimeSpend: item.lifetimeSpend.toString(),
      averageOrderValue: item.averageOrderValue.toString(),
    })),
    total,
    summary: {
      totalCustomers: summary?.totalCustomers || 0,
      totalSpend: (summary?.totalSpend || "0").toString(),
      avgAov: (summary?.avgAov || "0").toString(),
      totalSessions: summary?.totalSessions || 0,
    }
  }
}

export async function getCustomerDetailsAction(userId: string) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized access")
  }

  // 1. Fetch user & profile info
  const userDetails = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      phone: profiles.phone,
      dateOfBirth: profiles.dateOfBirth,
      newsletterPreference: profiles.newsletterPreference,
      accountStatus: profiles.accountStatus,
      verificationStatus: profiles.verificationStatus,
      customerTier: profiles.customerTier,
      loyaltyPoints: profiles.loyaltyPoints,
      riskScore: profiles.riskScore,
      fraudFlag: profiles.fraudFlag,
      marketingSource: profiles.marketingSource,
      referralSource: profiles.referralSource,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)

  const customer = userDetails[0]
  if (!customer) {
    throw new Error("Customer profile not found")
  }

  // 2. Fetch customer timeline logs
  const timeline = await db
    .select()
    .from(customerTimeline)
    .where(eq(customerTimeline.userId, userId))
    .orderBy(desc(customerTimeline.createdAt))
    .limit(50)

  // 3. Fetch latest sessions list
  const sessions = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.userId, userId))
    .orderBy(desc(userSessions.startedAt))
    .limit(10)

  return {
    customer,
    timeline,
    sessions,
  }
}

export async function getSystemHealthAction() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized access")
  }

  // 1. Get queue memory stats
  const { IngestionService } = require("@/features/analytics/ingestion/service")
  const queueStats = await IngestionService.getStats()

  // 2. Count unresolved DLQ events
  const [dlqCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analyticsDlq)
    .where(eq(analyticsDlq.resolved, false))

  const dlqCount = dlqCountResult?.count || 0

  // 3. Count active sessions in last 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
  const [activeSessionsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userSessions)
    .where(gte(userSessions.lastActivityAt, thirtyMinutesAgo))

  const activeSessions = activeSessionsResult?.count || 0

  // 4. Calculate average query processing latency
  const [latencyResult] = await db
    .select({
      avg: sql<number>`coalesce(avg(${userEvents.processingDuration}), 0)::int`,
    })
    .from(userEvents)

  const avgLatency = latencyResult?.avg || 0

  return {
    queueStats,
    dlqCount,
    activeSessions,
    avgLatency,
  }
}

export async function getDlqEventsAction() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized access")
  }

  const list = await db
    .select()
    .from(analyticsDlq)
    .orderBy(desc(analyticsDlq.failedAt))
    .limit(100)

  return list
}

export async function resolveDlqEventAction(id: string) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized access")
  }

  await db
    .update(analyticsDlq)
    .set({ resolved: true })
    .where(eq(analyticsDlq.id, id))

  return { success: true }
}

export async function deleteDlqEventAction(id: string) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized access")
  }

  await db
    .delete(analyticsDlq)
    .where(eq(analyticsDlq.id, id))

  return { success: true }
}
