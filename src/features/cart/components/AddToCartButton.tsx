"use client"

import { useActionState, useEffect } from "react"
import { addToCartAction } from "@/actions/cart.actions"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import { useAnalytics } from "@/features/analytics/ingestion/tracking-provider"
import { AnalyticsEvent } from "@/features/analytics/events/registry"

interface AddToCartButtonProps {
  variantId: string
  productId: string
  inStock: boolean
}

export function AddToCartButton({ variantId, productId, inStock }: AddToCartButtonProps) {
  const [state, action, isPending] = useActionState<any, FormData>(addToCartAction, null)
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    if (state?.success) {
      // Notify Header to refresh cart badge
      window.dispatchEvent(new Event("cart-updated"))
      // Analytics: CART_ADD — fire after confirmed server success
      trackEvent(
        AnalyticsEvent.CART_ADD,
        {},
        productId,
        null,
        null,
        null,
        variantId
      )
    }
    // state is the only dep that changes on submission
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <form action={action} className="w-full">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      
      <Button 
        type="submit" 
        size="lg" 
        className="w-full bg-text-primary border-text-primary text-surface hover:bg-text-primary/90 hover:border-text-primary/90 active:scale-[0.98] transition-all duration-300" 
        disabled={!inStock || isPending}
      >
        {isPending ? (
          "Adding..."
        ) : inStock ? (
          <span className="flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Add to Bag
          </span>
        ) : (
          "Out of Stock"
        )}
      </Button>

      {state && !state.success && state.error && (
        <p className="text-body-xs text-red-500 mt-2 text-center">
          {state.error.message || "Failed to add to cart"}
        </p>
      )}
    </form>
  )
}
