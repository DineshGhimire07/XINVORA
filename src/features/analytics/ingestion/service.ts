import { db } from "@/db/client"
import { userSessions, userEvents, customerMetrics, recommendationSignals, analyticsDlq } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { IngestEvent, AnalyticsEvent } from "../events/registry"

import { AnalyticsQueue } from "./queue/interface"
import { InMemoryAnalyticsQueue } from "./queue/memory"

const QUEUE_FLUSH_INTERVAL_MS = 2000
const MAX_BATCH_SIZE = 50
const MAX_RETRIES = 3

class IngestionPipeline {
  private queue: AnalyticsQueue
  private isProcessing = false
  private workerInterval: NodeJS.Timeout | null = null

  constructor(queue?: AnalyticsQueue) {
    this.queue = queue || new InMemoryAnalyticsQueue()
    this.startWorker()
  }

  public async enqueue(event: IngestEvent) {
    await this.queue.enqueue(event)
  }

  public startWorker() {
    if (this.workerInterval) return
    console.log(`[Ingestion] Worker started with interval ${QUEUE_FLUSH_INTERVAL_MS}ms`)
    this.workerInterval = setInterval(async () => {
      const size = await this.queue.size()
      if (size > 0 && !this.isProcessing) {
        this.flush()
      }
    }, QUEUE_FLUSH_INTERVAL_MS)
  }

  public stopWorker() {
    if (this.workerInterval) {
      clearInterval(this.workerInterval)
      this.workerInterval = null
    }
  }

  public async flush() {
    if (this.isProcessing) return
    const size = await this.queue.size()
    if (size === 0) return

    this.isProcessing = true
    
    // Drain batch from queue
    const batch = await this.queue.dequeue(MAX_BATCH_SIZE)
    console.log(`[Ingestion] Flushing batch of size ${batch.length}`)
    
    try {
      await this.processBatch(batch)
      console.log(`[Ingestion] Successfully flushed batch`)
    } catch (err) {
      console.error("Critical error flushing analytics batch:", err)
    } finally {
      this.isProcessing = false
    }
  }

  private async processBatch(events: IngestEvent[]) {
    // Process each event sequentially or in logical transaction chunks
    for (const rawEvent of events) {
      let retryCount = 0
      let success = false
      let lastError: any = null

      while (retryCount < MAX_RETRIES && !success) {
        try {
          await this.processSingleEvent(rawEvent)
          success = true
        } catch (err: any) {
          retryCount++
          lastError = err
          console.warn(`Retry ${retryCount}/${MAX_RETRIES} failed for event ${rawEvent.eventId}:`, err.message)
          // Add a short delay before retrying
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount))
        }
      }

      if (!success) {
        console.error(`Event ${rawEvent.eventId} failed all retries. Writing to Dead Letter Queue (DLQ).`)
        await this.writeToDlq(rawEvent, lastError)
      }
    }
  }

  private async processSingleEvent(event: IngestEvent) {
    const startTime = Date.now()
    const eventTime = event.createdAt ? new Date(event.createdAt) : new Date()

    await db.transaction(async (tx) => {
      // 1. Resolve or Create Session
      let session = await tx.query.userSessions.findFirst({
        where: eq(userSessions.sessionKey, event.sessionKey),
      })

      if (!session) {
        // Create a new session
        const payload = event.payload as any
        const payloadDevice = payload.deviceInfo || {}
        const geo = payload.geoInfo || {}
        const utm = payload.utmInfo || {}

        const [newSession] = await tx.insert(userSessions).values({
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
        }).returning()
        
        session = newSession
      } else {
        // Update session's last activity and identity merge if user logged in
        const updateValues: Record<string, any> = {
          lastActivityAt: eventTime,
        }
        if (event.userId && !session.userId) {
          updateValues.userId = event.userId
        }
        await tx.update(userSessions)
          .set(updateValues)
          .where(eq(userSessions.id, session.id))
      }

      // 2. Insert Event Row
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

      // 3. Update Customer Metrics Cache Incrementally
      const currentUserId = event.userId || session.userId
      if (currentUserId) {
        await this.updateMetricsIncremental(tx, currentUserId, event, eventTime)
      }

      // 4. Update Recommendation Signals (Brand & Category Affinity)
      if (currentUserId && event.productId) {
        await this.updateRecommendationSignals(tx, currentUserId, event, eventTime)
      }
    })
  }

  private async updateMetricsIncremental(tx: any, userId: string, event: IngestEvent, eventTime: Date) {
    // Check if customer metrics cache exists, or insert with default values first
    let metrics = await tx.query.customerMetrics.findFirst({
      where: eq(customerMetrics.userId, userId),
    })

    if (!metrics) {
      const [newMetrics] = await tx.insert(customerMetrics).values({
        userId,
        lastVisitAt: eventTime,
        updatedAt: eventTime,
      }).returning()
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
      // Find order to calculate total spend update
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

    await tx.update(customerMetrics)
      .set(updates)
      .where(eq(customerMetrics.userId, userId))
  }

  private async updateRecommendationSignals(tx: any, userId: string, event: IngestEvent, eventTime: Date) {
    let signal = await tx.query.recommendationSignals.findFirst({
      where: and(
        eq(recommendationSignals.userId, userId),
        eq(recommendationSignals.productId, event.productId!)
      ),
    })

    if (!signal) {
      const [newSignal] = await tx.insert(recommendationSignals).values({
        userId,
        productId: event.productId!,
        brandName: event.payload.brandName || null,
        categorySlug: event.payload.categorySlug || null,
        lastInteractionAt: eventTime,
        updatedAt: eventTime,
      }).returning()
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

    await tx.update(recommendationSignals)
      .set(updates)
      .where(eq(recommendationSignals.id, signal.id))
  }

  private async writeToDlq(event: IngestEvent, error: any) {
    console.error("🔥🔥🔥 DLQ CAUGHT ERROR:", error?.message, error)
    try {
      await db.insert(analyticsDlq).values({
        rawPayload: event,
        errorMessage: String(error?.message || "Unknown error").substring(0, 500),
        errorStack: String(error?.stack || "").substring(0, 2000) || null,
        resolved: false,
      })
    } catch (dlqErr) {
      console.error("Failed writing event to DLQ table!", dlqErr)
    }
  }

  public async getStats() {
    return {
      queueLength: await this.queue.size(),
      isWorkerActive: this.workerInterval !== null,
      maxBatchSize: MAX_BATCH_SIZE,
      flushIntervalMs: QUEUE_FLUSH_INTERVAL_MS,
    }
  }
}

// Global Ingestion Pipeline Singleton
const globalForIngestion = globalThis as unknown as {
  __ingestionPipeline: IngestionPipeline | undefined
}

export const IngestionService = globalForIngestion.__ingestionPipeline ?? new IngestionPipeline()

if (process.env.NODE_ENV !== "production") {
  globalForIngestion.__ingestionPipeline = IngestionService
}
