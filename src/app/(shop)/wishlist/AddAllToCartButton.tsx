"use client"

import { useTransition } from "react"
import { moveAllWishlistItemsToCartAction } from "@/actions/wishlist.actions"
import { useRouter } from "next/navigation"

export function AddAllToCartButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleAddAll = () => {
    startTransition(async () => {
      await moveAllWishlistItemsToCartAction()
      router.push("/cart")
    })
  }

  return (
    <button
      onClick={handleAddAll}
      disabled={isPending}
      className="px-6 py-2 bg-text-primary text-white text-body-sm tracking-widest uppercase hover:bg-text-secondary transition-colors disabled:opacity-50"
    >
      {isPending ? "Moving..." : "Add All to Cart"}
    </button>
  )
}
