"use client"

import * as React from "react"
import { toggleWishlistByProductIdAction } from "@/actions/wishlist.actions"

import { Heart } from "lucide-react"

interface WishlistToggleIconProps {
  productId: string
  initialIsWishlisted?: boolean
}

export function WishlistToggleIcon({ productId, initialIsWishlisted = false }: WishlistToggleIconProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(initialIsWishlisted)
  const [isPending, startTransition] = React.useTransition()

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
