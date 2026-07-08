"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { addToWishlistAction, removeFromWishlistAction } from "@/actions/wishlist.actions"

interface WishlistButtonProps {
  variantId: string
  wishlistItemId?: string
  isWishlisted: boolean
}

function SubmitButton({ isWishlisted }: { isWishlisted: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`p-2 transition-colors disabled:opacity-50 ${isWishlisted ? 'text-red-500' : 'text-text-primary hover:text-red-500'}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  )
}

export function WishlistButton({ variantId, wishlistItemId, isWishlisted }: WishlistButtonProps) {
  const [addState, addAction] = useActionState<any, FormData>(addToWishlistAction, null)
  const [removeState, removeAction] = useActionState<any, FormData>(removeFromWishlistAction, null)

  // If we don't have a wishlistItemId, we can only add
  if (isWishlisted && wishlistItemId) {
    return (
      <form action={removeAction}>
        <input type="hidden" name="wishlistItemId" value={wishlistItemId} />
        <SubmitButton isWishlisted={true} />
      </form>
    )
  }

  return (
    <form action={addAction}>
      <input type="hidden" name="variantId" value={variantId} />
      <SubmitButton isWishlisted={false} />
    </form>
  )
}
