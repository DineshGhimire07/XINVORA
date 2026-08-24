"use client"

/**
 * CollectionViewTracker — zero-render client component.
 *
 * Fires a COLLECTION_VIEW analytics event once when the collection page mounts.
 * collectionId is passed as a first-class field (not JSONB) enabling efficient
 * GROUP BY collection_id queries in the admin analytics Collections tab.
 *
 * Consent: trackEvent() internally checks analytics consent before sending.
 */

import { useEffect } from "react"
import { useAnalytics } from "@/features/analytics/ingestion/tracking-provider"
import { AnalyticsEvent } from "@/features/analytics/events/registry"

interface CollectionViewTrackerProps {
  collectionId: string
  collectionName?: string
}

export function CollectionViewTracker({ collectionId, collectionName }: CollectionViewTrackerProps) {
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    trackEvent(
      AnalyticsEvent.COLLECTION_VIEW,
      { collectionName },
      null,  // productId
      null,  // categoryId
      null,  // orderId
      collectionId
    )
    // Fire once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId])

  return null
}
