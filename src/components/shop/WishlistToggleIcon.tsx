"use client"

import * as React from "react"
import { toggleWishlistByProductIdAction } from "@/actions/wishlist.actions"
import { Heart } from "lucide-react"
import { useAnalytics } from "@/features/analytics/ingestion/tracking-provider"
import { AnalyticsEvent } from "@/features/analytics/events/registry"

interface WishlistToggleIconProps {
  productId: string
  initialIsWishlisted?: boolean
}

export function WishlistToggleIcon({ productId, initialIsWishlisted = false }: WishlistToggleIconProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(initialIsWishlisted)
  const [isPending, startTransition] = React.useTransition()
  const { trackEvent } = useAnalytics()

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isPending) return

    // Optimistic update
    setIsWishlisted(!isWishlisted)

    startTransition(async () => {
      const res = await toggleWishlistByProductIdAction(productId)
      if (!res.success) {
        // Revert on failure
        setIsWishlisted((prev) => !prev)
      } else if (res.data) {
        // Sync with server state
        setIsWishlisted(res.data.wishlisted)
        // Analytics: fire WISHLIST_ADD or WISHLIST_REMOVE based on confirmed server state
        trackEvent(
          res.data.wishlisted ? AnalyticsEvent.WISHLIST_ADD : AnalyticsEvent.WISHLIST_REMOVE,
          {},
          productId
        )
      }
    })
  }

  return (
    <button
      onClick={handleWishlist}
      disabled={isPending}
      className="absolute bottom-4 right-4 z-50 flex items-center justify-center text-text-primary hover:scale-110 transition-all disabled:opacity-70 disabled:hover:scale-100 pointer-events-auto"
      aria-label="Add to Wishlist"
    >
      <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-accent text-accent" : ""}`} />
    </button>
  )
}
