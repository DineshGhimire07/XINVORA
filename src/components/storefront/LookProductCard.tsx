"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState, useTransition } from "react"
import { addToCartAction } from "@/actions/cart.actions"
import { toggleWishlistByProductIdAction } from "@/actions/wishlist.actions"
import { ShoppingBag, Heart, Check } from "lucide-react"
import { useHeaderState } from "@/providers/header-state-provider"
import { cn } from "@/lib/utils"

interface PairedProduct {
  id: string
  name: string
  slug: string
  productImages: { url: string; altText: string | null }[]
  lowestPrice: number | null
  compareAtPrice: number | null
  offSection?: { originalPrice: number; sellingPrice: number; isOffEnabled: boolean } | null
  inStock: boolean
  defaultVariantId: string | null
}

interface LookProductCardProps {
  product: PairedProduct
  compact?: boolean
}

export function LookProductCard({ product, compact = false }: LookProductCardProps) {
  const { cartItemMap } = useHeaderState()
  const inCartQty = cartItemMap.get(product.id) || (product.defaultVariantId ? cartItemMap.get(product.defaultVariantId) || 0 : 0)

  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistPending, startWishlistTransition] = useTransition()
  const [cartPending, startCartTransition] = useTransition()
  const [isAdded, setIsAdded] = useState(false)

  // Non-navigating Add to Bag handler that opens cart drawer if item already in bag
  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.defaultVariantId || cartPending) return

    // If item is already in cart, open cart slide-over drawer smoothly
    if (inCartQty > 0) {
      window.dispatchEvent(new Event("cart-updated"))
      return
    }

    startCartTransition(async () => {
      const formData = new FormData()
      formData.append("variantId", product.defaultVariantId!)
      formData.append("quantity", "1")

      const res = await addToCartAction(null, formData)
      if (res?.success) {
        setIsAdded(true)
        window.dispatchEvent(new Event("cart-updated"))
        setTimeout(() => setIsAdded(false), 2000)
      }
    })
  }

  // Instant, non-navigating wishlist toggle that preserves scroll position
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Instant optimistic toggle (0ms latency UI response)
    setIsWishlisted((prev) => !prev)

    startWishlistTransition(async () => {
      const res = await toggleWishlistByProductIdAction(product.id)
      if (!res.success) {
        // Revert on failure
        setIsWishlisted((prev) => !prev)
      } else if (res.data) {
        setIsWishlisted(res.data.wishlisted)
      }
    })
  }

  const images = product.productImages || []
  const offEnabled = product.offSection?.isOffEnabled === true
  const effectiveOriginalPrice = offEnabled ? product.offSection!.originalPrice : product.compareAtPrice
  const effectiveSellingPrice = offEnabled ? product.offSection!.sellingPrice : product.lowestPrice

  const hasSale =
    effectiveOriginalPrice &&
    effectiveSellingPrice &&
    effectiveOriginalPrice > effectiveSellingPrice

  const discountPercent =
    hasSale && effectiveOriginalPrice && effectiveSellingPrice
      ? Math.round(((effectiveOriginalPrice - effectiveSellingPrice) / effectiveOriginalPrice) * 100)
      : 0

  const formatPrice = (minorUnits: number | null) => {
    if (minorUnits === null || minorUnits === undefined) return "Contact for Price"
    return `NPR ${Math.round(minorUnits / 100).toLocaleString()}`
  }

  return (
    <div className="group flex flex-col gap-0 text-left w-full relative">
      {/* Image Wrapper */}
      <div className="relative w-full aspect-[3/4] bg-surface-secondary overflow-hidden block border border-border/40">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.name}>
          {images.length > 0 ? (
            <Image
              src={images[0].url}
              alt={images[0].altText || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover object-top transition-opacity duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-text-tertiary uppercase select-none tracking-widest">
              No Image
            </div>
          )}
        </Link>

        {/* Badges */}
        {!product.inStock ? (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[8px] font-bold tracking-[0.25em] uppercase bg-text-primary text-background select-none shadow-xs pointer-events-none">
            Sold Out
          </span>
        ) : inCartQty > 0 ? (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[8px] font-bold tracking-[0.2em] uppercase bg-surface text-text-primary border border-border/80 shadow-xs select-none pointer-events-none">
            In Bag ({inCartQty})
          </span>
        ) : null}

        {hasSale && (
          <span className="absolute top-3 right-3 z-10 text-[8px] font-bold tracking-[0.2em] uppercase select-none border border-accent/40 bg-surface text-accent px-2 py-1 leading-none shadow-xs pointer-events-none">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button - Transparent background */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistPending}
          className="absolute bottom-4 right-4 z-20 flex items-center justify-center text-text-primary hover:scale-110 active:scale-95 transition-all cursor-pointer bg-transparent"
          aria-label="Add to Wishlist"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors duration-150",
              isWishlisted ? "fill-accent text-accent" : "fill-none text-text-secondary"
            )}
          />
        </button>
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-2 pt-3 px-0.5">
        {/* Name */}
        <Link href={`/products/${product.slug}`} className="block">
          <span className="font-sans text-[10px] font-bold tracking-[0.14em] text-text-primary uppercase truncate block hover:text-text-secondary transition-colors duration-200">
            {product.name}
          </span>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-3.5 select-none font-mono">
          {hasSale ? (
            <>
              <span className="line-through font-normal text-[10px] text-text-tertiary">
                {formatPrice(effectiveOriginalPrice)}
              </span>
              <span className="font-semibold text-[11px] text-text-primary">
                {formatPrice(effectiveSellingPrice)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-[11px] text-text-primary">
              {formatPrice(effectiveSellingPrice)}
            </span>
          )}
        </div>

        {/* Add to Bag */}
        {!product.inStock ? (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center py-3 px-4 rounded-[6px] text-[10px] font-bold tracking-[0.25em] uppercase bg-surface-secondary text-text-secondary/60 cursor-not-allowed opacity-70"
          >
            Out of Stock
          </button>
        ) : product.defaultVariantId ? (
          <form onSubmit={handleAddToCart} className="w-full">
            <button
              type="submit"
              disabled={cartPending}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[6px] text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-[0.99] cursor-pointer",
                inCartQty > 0
                  ? "bg-surface-elevated text-text-primary border border-border/80 hover:bg-text-primary hover:text-background"
                  : "bg-text-primary text-background hover:opacity-90"
              )}
            >
              {cartPending ? (
                <span className="opacity-60">Adding…</span>
              ) : isAdded ? (
                <>
                  <Check className="w-4 h-4 shrink-0 stroke-[2] text-accent" />
                  Added
                </>
              ) : inCartQty > 0 ? (
                <>
                  <Check className="w-4 h-4 shrink-0 stroke-[2] text-accent" />
                  In Bag ({inCartQty})
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  Add to Bag
                </>
              )}
            </button>
          </form>
        ) : (
          <button
            disabled
            className="w-full py-2.5 border border-border/60 text-text-tertiary text-[9px] font-bold tracking-[0.25em] uppercase opacity-50 cursor-not-allowed"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  )
}
