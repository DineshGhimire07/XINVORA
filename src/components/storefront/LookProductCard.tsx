"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useActionState, useEffect, useState, useTransition } from "react"
import { addToCartAction } from "@/actions/cart.actions"
import { toggleWishlistByProductIdAction } from "@/actions/wishlist.actions"
import { ShoppingBag, Heart } from "lucide-react"
import { NotifyMeButton } from "@/components/storefront/NotifyMeButton"

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
  const [state, action, isPending] = useActionState<any, FormData>(addToCartAction, null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistPending, startWishlistTransition] = useTransition()

  useEffect(() => {
    if (state?.success) {
      window.dispatchEvent(new Event("cart-updated"))
    }
  }, [state])

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (wishlistPending) return
    setIsWishlisted((prev) => !prev)
    startWishlistTransition(async () => {
      const res = await toggleWishlistByProductIdAction(product.id)
      if (!res.success) {
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
      <Link href={`/products/${product.slug}`} className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden block">
        {images.length > 0 ? (
          <Image
            src={images[0].url}
            alt={images[0].altText || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover object-top transition-opacity duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 uppercase select-none tracking-widest">
            No Image
          </div>
        )}

        {/* Badges */}
        {!product.inStock ? (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[8px] font-bold tracking-[0.25em] uppercase bg-neutral-900 text-white select-none">
            Sold Out
          </span>
        ) : hasSale ? (
          <span 
            className="absolute top-3 right-3 z-10 text-[8px] font-bold tracking-[0.2em] uppercase select-none border"
            style={{ 
              backgroundColor: '#FCFBF8',
              borderColor: 'rgba(201, 169, 106, 0.5)',
              color: '#C9A96A',
              paddingTop: '5px',
              paddingBottom: '4px',
              paddingLeft: '8px',
              paddingRight: '8px',
              lineHeight: '1'
            }}
          >
            -{discountPercent}% OFF
          </span>
        ) : null}

        {/* Wishlist — bottom right, same as ProductCard */}
        <button
          onClick={handleWishlist}
          disabled={wishlistPending}
          className="absolute bottom-4 right-4 z-20 flex items-center justify-center text-neutral-800 hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100"
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-200 ${
              isWishlisted ? "fill-neutral-900 text-neutral-900" : "fill-none text-neutral-700"
            }`}
          />
        </button>
      </Link>

      {/* Product info */}
      <div className="flex flex-col gap-2 pt-3 px-0.5">
        {/* Name */}
        <Link href={`/products/${product.slug}`} className="block">
          <span className="font-sans text-[10px] font-medium tracking-[0.12em] text-neutral-800 uppercase truncate block hover:text-neutral-500 transition-colors duration-200">
            {product.name}
          </span>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-3.5 select-none font-mono">
          {hasSale ? (
            <>
              <span className="line-through font-normal text-[10px]" style={{ color: '#9A9A9A' }}>
                {formatPrice(effectiveOriginalPrice)}
              </span>
              <span className="font-semibold text-[11px]" style={{ color: '#1A1A1A' }}>
                {formatPrice(effectiveSellingPrice)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-[11px]" style={{ color: '#1A1A1A' }}>
              {formatPrice(effectiveSellingPrice)}
            </span>
          )}
        </div>

        {/* Add to Bag or Notify Me */}
        {!product.inStock ? (
          <div className="w-full">
            <NotifyMeButton productId={product.id} variant="inline" />
          </div>
        ) : product.defaultVariantId ? (
          <form action={action} className="w-full">
            <input type="hidden" name="variantId" value={product.defaultVariantId} />
            <input type="hidden" name="quantity" value="1" />
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-800 text-[8px] font-bold tracking-[0.28em] uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isPending ? (
                <span className="opacity-60">Adding…</span>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3 shrink-0" />
                  Add to Bag
                </>
              )}
            </button>
          </form>
        ) : (
          <button
            disabled
            className="w-full py-2.5 border border-neutral-200 text-neutral-400 text-[8px] font-bold tracking-[0.28em] uppercase opacity-50 cursor-not-allowed"
          >
            Unavailable
          </button>
        )}

        {state && !state.success && state.error && (
          <p className="text-[9px] text-red-500 text-center font-sans tracking-wide">
            {state.error.message || "Failed to add"}
          </p>
        )}
      </div>
    </div>
  )
}
