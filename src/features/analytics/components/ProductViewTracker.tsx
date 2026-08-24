"use client"

/**
 * ProductViewTracker — zero-render client component.
 *
 * Fires a PRODUCT_VIEW analytics event once when the product page mounts.
 * Must be a client component because trackEvent() requires browser context.
 * The parent product page is a server component — this component is the
 * minimal client boundary needed for analytics.
 *
 * Consent: trackEvent() internally checks analytics consent before sending.
 * No event is sent if analytics consent has not been given.
 */

import { useEffect } from "react"
import { useAnalytics } from "@/features/analytics/ingestion/tracking-provider"
import { AnalyticsEvent } from "@/features/analytics/events/registry"

interface ProductViewTrackerProps {
  productId: string
  categoryId?: string | null
}

export function ProductViewTracker({ productId, categoryId }: ProductViewTrackerProps) {
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    trackEvent(
      AnalyticsEvent.PRODUCT_VIEW,
      {},
      productId,
      categoryId ?? null
    )
    // Fire once on mount. productId is stable for a given PDP.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  return null
}
