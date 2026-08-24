"use client"

/**
 * PaymentFailTracker — fires PAYMENT_FAIL analytics event once on mount.
 */

import { useEffect } from "react"
import { useAnalytics } from "@/features/analytics/ingestion/tracking-provider"
import { AnalyticsEvent } from "@/features/analytics/events/registry"

export function PaymentFailTracker() {
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    trackEvent(AnalyticsEvent.PAYMENT_FAIL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
