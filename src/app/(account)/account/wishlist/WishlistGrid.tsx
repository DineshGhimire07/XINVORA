"use client"

import { useState } from "react"
import { removeWishlistItemAction, moveWishlistItemToCartAction } from "@/actions/wishlist.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Grid } from "@/components/shared/grid"
import Link from "next/link"

interface WishlistItem {
  id: string
  price: number | null
  variant: {
    id: string
    sku: string
    product: {
      id: string
      name: string
      slug: string
    }
    color: { name: string } | null
    size: { name: string } | null
    images: { url: string; altText: string | null }[]
  }
}

interface WishlistGridProps {
  initialItems: WishlistItem[]
}

export function WishlistGrid({ initialItems }: WishlistGridProps) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRemove = async (itemId: string) => {
    setLoadingId(itemId)
    setError(null)
    const result = await removeWishlistItemAction(itemId)
    if (result.success) {
      setItems(items.filter((i) => i.id !== itemId))
    } else {
      setError(result.error?.message || "Failed to remove item.")
    }
    setLoadingId(null)
  }

  const handleMoveToCart = async (itemId: string) => {
    setLoadingId(itemId)
    setError(null)
    const result = await moveWishlistItemToCartAction(itemId)
    if (result.success) {
      setItems(items.filter((i) => i.id !== itemId))
    } else {
      setError(result.error?.message || "Failed to move item to cart.")
    }
    setLoadingId(null)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <Card className="rounded-none border-dashed border-border-primary/60 text-center p-12 bg-surface-secondary/5">
          <p className="text-body-sm text-text-secondary">Your wishlist is currently empty.</p>
          <Link href="/shop" className="mt-4 inline-block text-[11px] uppercase tracking-widest underline hover:text-accent font-semibold">
            Explore Collection
          </Link>
        </Card>
      ) : (
        <Grid cols={{ base: 1, sm: 2, md: 3 }} gap={6}>
          {items.map((item) => {
            const displayImage = item.variant.images[0]?.url || "https://placehold.co/300x400?text=No+Image"
            const formattedPrice = item.price ? `$${(item.price / 100).toFixed(2)}` : "Price Unavailable"

            return (
              <Card key={item.id} className="rounded-none border-border-primary/30 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface-secondary/20">
                    <img
                      src={displayImage}
                      alt={item.variant.product.name}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="pt-4 space-y-1">
                    <h3 className="text-body-sm font-medium text-text-primary">
                      <Link href={`/products/${item.variant.product.slug}`} className="hover:underline">
                        {item.variant.product.name}
                      </Link>
                    </h3>
                    <p className="text-caption text-text-secondary">
                      {item.variant.color?.name && `Color: ${item.variant.color.name}`}
                      {item.variant.size?.name && ` | Size: ${item.variant.size.name}`}
                    </p>
                    <p className="text-body-sm font-semibold text-text-primary mt-1">{formattedPrice}</p>
                  </CardContent>
                </div>

                <div className="p-4 border-t border-border/40 space-y-2">
                  <Button
                    onClick={() => handleMoveToCart(item.id)}
                    disabled={loadingId === item.id}
                    className="w-full rounded-none py-2 uppercase tracking-widest text-[10px] font-semibold"
                  >
                    Move to Bag
                  </Button>
                  <Button
                    onClick={() => handleRemove(item.id)}
                    disabled={loadingId === item.id}
                    variant="outline"
                    className="w-full rounded-none py-2 uppercase tracking-widest text-[10px] font-semibold border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            )
          })}
        </Grid>
      )}
    </div>
  )
}
