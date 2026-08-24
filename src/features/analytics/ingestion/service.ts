/**
 * features/analytics/ingestion/service.ts — XINVORA Analytics Ingestion
 *
 * Architecture (after refactor):
 *
 *   CLIENT → POST /api/analytics/event
 *       ↓
 *   validate + enrich event (synchronous, fast)
 *       ↓
 *   202 Accepted  ← HTTP response sent to client
 *       ↓ (after() — runs after response is flushed)
 *   processAnalyticsEvent(event)
 *       ↓
 *   db.transaction(session + userEvent + metrics + signals)
 *       ↓
 *   on failure → writeToDlq()
 *
 * WHY THE OLD setInterval WORKER WAS REMOVED:
 *   Vercel serverless functions are ephemeral. Each cold start creates a new
 *   module scope. Although we used globalThis to share the IngestionPipeline
 *   singleton within a single instance, Vercel can run many concurrent instances
 *   simultaneously — each with its own isolated memory and its own setInterval.
 *   This caused:
 *     - Multiple workers competing to update the same user_sessions rows
 *     - 16–105 s lock-wait times observed in Supabase logs
 *     - Silent event loss when instances are recycled mid-batch
 *
 *   The replacement: after() from next/server processes each event exactly once,
 *   immediately after the HTTP response is sent, within the same function
 *   invocation lifetime. No shared state, no lost events, no competing workers.
 *
 * IMPORTANT CONSTRAINTS:
 *   - Do NOT use processAnalyticsEvent() inside checkout/payment/inventory paths.
 *     Those are transactional and must remain synchronous/guaranteed.
 *   - Analytics failure must never propagate to the caller (always catch internally).
 */

import { db } from "@/db/client"
import { userSessions, userEvents, customerMetrics, recommendationSignals, analyticsDlq } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { IngestEvent, AnalyticsEvent } from "../events/registry"

/**
 * Maximum wall-clock time (ms) allowed for a single analytics event attempt.
 *
 * Implemented as `SET LOCAL statement_timeout` inside the Drizzle transaction,
 * which instructs the PostgreSQL server to cancel any statement exceeding this
 * value. SET LOCAL is scoped to the current transaction only and is automatically
 * rolled back on commit/rollback — the pooled connection is left clean.
 */
const EVENT_ATTEMPT_TIMEOUT_MS = 5_000

/**
 * Maximum number of retries before giving up and writing to the DLQ.
 */
const MAX_RETRIES = 3

/**
 * processAnalyticsEvent — the single entry point for analytics persistence.
 *
 * Call this inside next/server's after() so it runs after the HTTP response
 * has been sent. This is the serverless-safe replacement for the old
 * setInterval-based InMemoryAnalyticsQueue + IngestionPipeline worker.
 *
 * Errors are caught, logged, and written to the analyticsDlq table.
 * This function NEVER throws — analytics must not block or break callers.
 */
export async function processAnalyticsEvent(event: IngestEvent): Promise<void> {
  let retryCount = 0
  let success = false
  let lastError: any = null

  while (retryCount < MAX_RETRIES && !success) {
    try {
      await _processSingleEvent(event)
      success = true
    } catch (err: any) {
      retryCount++
      lastError = err
      console.warn(
        `[Analytics] Retry ${retryCount}/${MAX_RETRIES} for event ${event.eventId}: ${err.message}`
      )
      // Brief delay before retry — exponential-ish backoff
      await new Promise((resolve) => setTimeout(resolve, 100 * retryCount))
    }
  }

  if (!success) {
    console.error(`[Analytics] Event ${event.eventId} failed all ${MAX_RETRIES} retries. Writing to DLQ.`)
    await _writeToDlq(event, lastError)
  }
}

// ── Internal implementation ────────────────────────────────────────────────

async function _processSingleEvent(event: IngestEvent): Promise<void> {
  const startTime = Date.now()
  const eventTime = event.createdAt ? new Date(event.createdAt) : new Date()

  await db.transaction(async (tx) => {
    // Bound this entire transaction on the PostgreSQL server side.
    // SET LOCAL applies only within this transaction block.
    // sql.raw is required — PostgreSQL does not support $1 binding for SET.
    await tx.execute(sql.raw(`SET LOCAL statement_timeout = ${EVENT_ATTEMPT_TIMEOUT_MS}`))

    // ── 1. Resolve or Create Session ──────────────────────────────────────
    let session = await tx.query.userSessions.findFirst({
      where: eq(userSessions.sessionKey, event.sessionKey),
    })

    if (!session) {
      const payload = event.payload as any
      const payloadDevice = payload.deviceInfo || {}
      const geo = payload.geoInfo || {}
      const utm = payload.utmInfo || {}

      try {
        const [newSession] = await tx
          .insert(userSessions)
          .values({
            userId: event.userId || null,
            sessionKey: event.sessionKey,
            startedAt: eventTime,
            lastActivityAt: eventTime,
            deviceType: event.device,
            browser: payloadDevice.browser || "Unknown",
            operatingSystem: payloadDevice.os || "Unknown",
            ipAddress: payload.ipAddress || "127.0.0.1",
            countryCode: event.country || geo.countryCode || null,
            region: geo.region || null,
            city: geo.city || null,
            timezone: geo.timezone || null,
            utmSource: utm.source || null,
            utmMedium: utm.medium || null,
            utmCampaign: utm.campaign || null,
          })
          .onConflictDoNothing()
          .returning()

        if (newSession) {
          session = newSession
        } else {
          // Another concurrent request already created the session
          session = await tx.query.userSessions.findFirst({
            where: eq(userSessions.sessionKey, event.sessionKey),
          })
        }
      } catch {
        // Race condition — fetch the existing row
        session = await tx.query.userSessions.findFirst({
          where: eq(userSessions.sessionKey, event.sessionKey),
        })
      }
    } else {
      // ── Debounce lastActivityAt to at most once per 60 s per session ────
      // This prevents high-frequency lock contention on user_sessions rows.
      // Previously observed: ~10,942 updates, avg 582 ms, cumulative 6.3M ms.
      const ACTIVITY_THROTTLE_MS = 60_000
      const isStaleActivity =
        !session.lastActivityAt ||
        eventTime.getTime() - new Date(session.lastActivityAt).getTime() > ACTIVITY_THROTTLE_MS
      const isUserMerge = Boolean(event.userId && !session.userId)

      if (isStaleActivity || isUserMerge) {
        const updateValues: Record<string, any> = {}
        if (isStaleActivity) updateValues.lastActivityAt = eventTime
        if (isUserMerge) updateValues.userId = event.userId

        await tx.update(userSessions).set(updateValues).where(eq(userSessions.id, session.id))
      }
    }

    if (!session) {
      throw new Error(`[Analytics] Failed to resolve or create session for key: ${event.sessionKey}`)
    }

    // ── 2. Insert Event Row ────────────────────────────────────────────────
    const processingDuration = Date.now() - startTime
    await tx.insert(userEvents).values({
      eventId: event.eventId,
      sessionId: session.id,
      userId: event.userId || session.userId || null,
      eventType: event.eventType,
      productId: event.productId || null,
      categoryId: event.categoryId || null,
      orderId: event.orderId || null,
      page: event.page,
      referrer: event.referrer || null,
      device: event.device,
      country: event.country || session.countryCode || null,
      receivedAt: new Date(startTime),
      processedAt: new Date(),
      processingDuration: processingDuration,
      source: event.source,
      payload: event.payload,
      createdAt: eventTime,
    })

    // ── 3. Update Customer Metrics Cache Incrementally ─────────────────────
    const currentUserId = event.userId || session.userId
    if (currentUserId) {
      await _updateMetricsIncremental(tx, currentUserId, event, eventTime)
    }

    // ── 4. Update Recommendation Signals (Brand & Category Affinity) ───────
    if (currentUserId && event.productId) {
      await _updateRecommendationSignals(tx, currentUserId, event, eventTime)
    }
  })
}

async function _updateMetricsIncremental(
  tx: any,
  userId: string,
  event: IngestEvent,
  eventTime: Date
): Promise<void> {
  let metrics = await tx.query.customerMetrics.findFirst({
    where: eq(customerMetrics.userId, userId),
  })

  if (!metrics) {
    const [newMetrics] = await tx
      .insert(customerMetrics)
      .values({ userId, lastVisitAt: eventTime, updatedAt: eventTime })
      .returning()
    metrics = newMetrics
  }

  const updates: Record<string, any> = {
    lastVisitAt: eventTime,
    updatedAt: new Date(),
  }

  if (event.eventType === AnalyticsEvent.WISHLIST_ADD) {
    updates.wishlistCount = metrics.wishlistCount + 1
  } else if (event.eventType === AnalyticsEvent.WISHLIST_REMOVE) {
    updates.wishlistCount = Math.max(0, metrics.wishlistCount - 1)
  } else if (event.eventType === AnalyticsEvent.CART_ADD) {
    updates.cartCount = metrics.cartCount + 1
  } else if (event.eventType === AnalyticsEvent.CART_REMOVE) {
    updates.cartCount = Math.max(0, metrics.cartCount - 1)
  } else if (event.eventType === AnalyticsEvent.ORDER_COMPLETE && event.orderId) {
    const order = await tx.query.orders.findFirst({
      where: eq(sql`id`, event.orderId),
    })

    if (order) {
      const orderTotal = BigInt(order.total || 0)
      const totalOrders = metrics.totalOrders + 1
      const lifetimeSpend = BigInt(metrics.lifetimeSpend || BigInt(0)) + orderTotal
      const averageOrderValue = lifetimeSpend / BigInt(totalOrders)

      updates.totalOrders = totalOrders
      updates.lifetimeSpend = lifetimeSpend
      updates.averageOrderValue = averageOrderValue
      updates.lastPurchaseAt = eventTime
    }
  }

  await tx.update(customerMetrics).set(updates).where(eq(customerMetrics.userId, userId))
}

async function _updateRecommendationSignals(
  tx: any,
  userId: string,
  event: IngestEvent,
  eventTime: Date
): Promise<void> {
  let signal = await tx.query.recommendationSignals.findFirst({
    where: and(
      eq(recommendationSignals.userId, userId),
      eq(recommendationSignals.productId, event.productId!)
    ),
  })

  if (!signal) {
    const [newSignal] = await tx
      .insert(recommendationSignals)
      .values({
        userId,
        productId: event.productId!,
        brandName: event.payload.brandName || null,
        categorySlug: event.payload.categorySlug || null,
        lastInteractionAt: eventTime,
        updatedAt: eventTime,
      })
      .returning()
    signal = newSignal
  }

  const updates: Record<string, any> = {
    lastInteractionAt: eventTime,
    updatedAt: new Date(),
  }

  if (event.eventType === AnalyticsEvent.PRODUCT_VIEW) {
    updates.viewsCount = signal.viewsCount + 1
  } else if (event.eventType === AnalyticsEvent.WISHLIST_ADD) {
    updates.wishlistAddsCount = signal.wishlistAddsCount + 1
  } else if (event.eventType === AnalyticsEvent.CART_ADD) {
    updates.cartAddsCount = signal.cartAddsCount + 1
  } else if (event.eventType === AnalyticsEvent.ORDER_COMPLETE) {
    updates.purchasesCount = signal.purchasesCount + 1
  } else if (event.eventType === AnalyticsEvent.RETURN) {
    updates.returnsCount = signal.returnsCount + 1
  }

  await tx
    .update(recommendationSignals)
    .set(updates)
    .where(eq(recommendationSignals.id, signal.id))
}

async function _writeToDlq(event: IngestEvent, error: any): Promise<void> {
  try {
    await db.insert(analyticsDlq).values({
      rawPayload: event,
      errorMessage: String(error?.message || "Unknown error").substring(0, 500),
      errorStack: String(error?.stack || "").substring(0, 2000) || null,
      resolved: false,
    })
  } catch (dlqErr) {
    // DLQ write failed — log only, do not re-throw
    console.error("[Analytics] Failed writing event to DLQ:", dlqErr)
  }
}

// ── Legacy compatibility shim ──────────────────────────────────────────────
// The old IngestionService.enqueue() API is preserved here as a no-op shim
// so that any future accidental import doesn't break compilation.
// The analytics/event API route now calls processAnalyticsEvent() directly
// inside after() instead of using this class.

/** @deprecated Use processAnalyticsEvent() inside after() instead. */
export const IngestionService = {
  enqueue: async (event: IngestEvent) => {
    console.warn(
      "[Analytics] IngestionService.enqueue() is deprecated. " +
        "Call processAnalyticsEvent(event) inside after() from next/server."
    )
    await processAnalyticsEvent(event)
  },
}
