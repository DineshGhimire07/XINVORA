"use client"

/**
 * PaymentSuccessTracker — fires ORDER_COMPLETE + PAYMENT_SUCCESS analytics events
 * once when the payment success page mounts.
 *
 * This is a zero-render client component because the payment/success page is a
 * server component. orderId is passed as a prop from the server page.
 *
 * Note on consent: These events are currently gated behind analytics consent
 * (conservative default). Pending business/legal decision on whether
 * ORDER_COMPLETE/PAYMENT_SUCCESS should be classified as operational events
 * that bypass consent. See implementation_plan.md Section C.
 */

import { useEffect } from "react"
import { useAnalytics } from "@/features/analytics/ingestion/tracking-provider"
import { AnalyticsEvent } from "@/features/analytics/events/registry"

interface PaymentSuccessTrackerProps {
  orderId?: string | null
}

export function PaymentSuccessTracker({ orderId }: PaymentSuccessTrackerProps) {
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    // ORDER_COMPLETE: marks a completed purchase funnel step
    trackEvent(AnalyticsEvent.ORDER_COMPLETE, {}, null, null, orderId ?? null)
    // PAYMENT_SUCCESS: payment provider confirmed
    trackEvent(AnalyticsEvent.PAYMENT_SUCCESS, {}, null, null, orderId ?? null)
    // Fire once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
