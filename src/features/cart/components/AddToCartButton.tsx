"use client"

import { useActionState, useEffect } from "react"
import { addToCartAction } from "@/actions/cart.actions"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

interface AddToCartButtonProps {
  variantId: string
  inStock: boolean
}

export function AddToCartButton({ variantId, inStock }: AddToCartButtonProps) {
  const [state, action, isPending] = useActionState<any, FormData>(addToCartAction, null)

  // Notify Header to refresh cart badge after successful add
  useEffect(() => {
    if (state?.success) {
      window.dispatchEvent(new Event("cart-updated"))
    }
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

