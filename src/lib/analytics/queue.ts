import type { AnalyticsEventPayload } from "@/types/analytics"

class AnalyticsEventQueue {
  private queue: AnalyticsEventPayload[] = []
  private batchSize: number = 5
  private flushIntervalMs: number = 3000
  private timer: NodeJS.Timeout | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.timer = setInterval(() => this.flush(), this.flushIntervalMs)
    }
  }

  enqueue(event: AnalyticsEventPayload) {
    this.queue.push(event)
    if (this.queue.length >= this.batchSize) {
      this.flush()
    }
  }

  async flush() {
    if (this.queue.length === 0) return

    const eventsToFlush = [...this.queue]
    this.queue = []

    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: eventsToFlush }),
      })
    } catch (err) {
      console.warn("[AnalyticsQueue] Failed to flush events batch, re-queuing:", err)
      // Re-queue failed events
      this.queue.unshift(...eventsToFlush.slice(0, 10))
    }
  }
}

export const analyticsQueue = new AnalyticsEventQueue()
