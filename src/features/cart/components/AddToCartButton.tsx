"use client"

import { useActionState } from "react"
import { addToCartAction } from "@/actions/cart.actions"
import { Button } from "@/components/ui/button"

interface AddToCartButtonProps {
  variantId: string
  inStock: boolean
}

export function AddToCartButton({ variantId, inStock }: AddToCartButtonProps) {
  const [state, action, isPending] = useActionState<any, FormData>(addToCartAction, null)

  return (
    <form action={action} className="w-full">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      
      <Button 
        type="submit" 
        variant="primary" 
        size="lg" 
        className="w-full" 
        disabled={!inStock || isPending}
      >
        {isPending ? "Adding..." : inStock ? "Add to Bag" : "Out of Stock"}
      </Button>

      {state && !state.success && state.error && (
        <p className="text-body-xs text-red-500 mt-2 text-center">
          {state.error.message || "Failed to add to cart"}
        </p>
      )}
    </form>
  )
}
