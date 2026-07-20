import type { AnalyticsEventPayload, EventName } from "@/types/analytics"
import { getOrCreateAnonymousId } from "./anonymous"
import { getCorrelationId } from "./correlation"
import { analyticsQueue } from "./queue"
import { parseAndVerifySignedCookie, CONSENT_COOKIE_NAME } from "@/lib/cookies/cookie"

export function trackEvent(eventName: EventName, metadata?: Record<string, any>, extraProps?: Partial<AnalyticsEventPayload>) {
  if (typeof window === "undefined") return

  // Check consent cookie from document.cookie
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`))
  const cookieValue = match ? decodeURIComponent(match[1]) : null
  const consent = parseAndVerifySignedCookie(cookieValue)

  // Enforce consent gating — If analytics consent is not given, ignore tracking
  if (!consent || !consent.analytics) {
    return
  }

  const payload: AnalyticsEventPayload = {
    eventName,
    correlationId: getCorrelationId(),
    page: window.location.href,
    path: window.location.pathname,
    metadata,
    ...extraProps,
  }

  analyticsQueue.enqueue(payload)
}

export function trackProductViewed(productId: string, productName: string, price: number, categoryName?: string) {
  trackEvent("PRODUCT_VIEW", { productName, price, categoryName }, { productId })
}

export function trackCheckoutStarted(cartValue: number, itemCount: number) {
  trackEvent("START_CHECKOUT", { cartValue, itemCount })
}

export function trackSearch(query: string, resultsCount: number) {
  trackEvent("SEARCH", { query, resultsCount })
}
