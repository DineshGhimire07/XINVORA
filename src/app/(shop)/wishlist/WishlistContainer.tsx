"use client"

import { useState, useTransition } from "react"
import { removeWishlistItemAction, moveWishlistItemToCartAction, moveAllWishlistItemsToCartAction, clearWishlistAction } from "@/actions/wishlist.actions"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { WishlistHero } from "./WishlistHero"
import { WishlistToolbar } from "./WishlistToolbar"
import { WishlistGrid } from "./WishlistGrid"
import { WishlistUtilityPanel } from "./WishlistUtilityPanel"
import { WishlistItem } from "./WishlistCard"

interface WishlistContainerProps {
  initialItems: WishlistItem[]
}

export function WishlistContainer({ initialItems }: WishlistContainerProps) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems)
  const [sortBy, setSortBy] = useState<string>("recently-added")
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleRemove = async (itemId: string) => {
    setLoadingId(itemId)
    setError(null)
    const result = await removeWishlistItemAction(itemId)
    if (result.success) {
      setItems(prev => prev.filter(i => i.id !== itemId))
      router.refresh()
    } else {
      setError(result.error?.message || "Failed to remove item.")
    }
    setLoadingId(null)
  }

  const handleAddToCart = async (variantId: string, itemId: string) => {
    setLoadingId(itemId)
    setError(null)
    const result = await moveWishlistItemToCartAction(itemId)
    if (result.success) {
      setItems(prev => prev.filter(i => i.id !== itemId))
      router.refresh()
    } else {
      setError(result.error?.message || "Failed to add item to cart.")
    }
    setLoadingId(null)
  }

  const handleAddAllToCart = () => {
    setError(null)
    startTransition(async () => {
      const result = await moveAllWishlistItemsToCartAction()
      if (result.success) {
        setItems([])
        router.push("/cart")
        router.refresh()
      } else {
        setError(result.error?.message || "Failed to add all items to cart.")
      }
    })
  }

  const handleClearWishlist = () => {
    setError(null)
    setIsClearing(true)
    startTransition(async () => {
      const result = await clearWishlistAction()
      if (result.success) {
        setItems([])
        router.refresh()
      } else {
        setError(result.error?.message || "Failed to clear wishlist.")
      }
      setIsClearing(false)
    })
  }


  // Client-side sorting logic
  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return (a.price || 0) - (b.price || 0)
      case "price-high-low":
        return (b.price || 0) - (a.price || 0)
      case "newest":
        // Sort by variant SKU or alphabetical product name as fallback
        return b.variant.product.name.localeCompare(a.variant.product.name)
      case "oldest":
        return a.variant.product.name.localeCompare(b.variant.product.name)
      case "recently-added":
      default:
        // Maintains default array index order
        return 0
    }
  })

  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0)

  // Empty State Layout
  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center select-none py-12">
        <div className="w-16 h-16 rounded-full bg-[#FBFBFA] border border-[#ECE7DF] flex items-center justify-center text-[#CFCFCF] mb-6">
          <Heart className="w-7 h-7 stroke-[1.25]" />
        </div>
        <h1 className="text-display-xs font-display text-[#222222] uppercase tracking-wide mb-2">
          Your Wishlist is Empty
        </h1>
        <p className="text-body-sm text-[#757575] max-w-sm mb-8 leading-relaxed">
          Discover timeless pieces you'll love and save them here.
        </p>
        <Link href="/search">
          <button className="bg-accent hover:bg-accent-hover text-white px-8 py-3 text-[10px] uppercase tracking-widest font-semibold transition-colors duration-300 rounded-none">
            Continue Shopping
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-sm text-left">
          {error}
        </div>
      )}

      {/* Hero Header */}
      <WishlistHero itemCount={items.length} />

      {/* Toolbar / Sort Bar */}
      <WishlistToolbar 
        itemCount={items.length} 
        sortBy={sortBy} 
        onSortChange={setSortBy} 
      />

      {/* Grid Content Split Area: Grid & Sidebar Utility Panel matching Cart page layout exactly */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Wishlist Grid (8 columns width) */}
        <div className="lg:col-span-8 flex flex-col">
          <WishlistGrid
            items={sortedItems}
            loadingId={loadingId}
            onRemove={handleRemove}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Sidebar Sticky Panel (4 columns width) */}
        <div className="lg:col-span-4 order-2 mt-4 lg:mt-0">
          <div className="sticky top-32">
            <WishlistUtilityPanel
              itemCount={items.length}
              totalAmount={totalAmount}
              onAddAllToCart={handleAddAllToCart}
              onClearWishlist={handleClearWishlist}
              isPending={isPending}
              isClearing={isClearing}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
