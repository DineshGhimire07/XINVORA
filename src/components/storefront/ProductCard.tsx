"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { toggleWishlistByProductIdAction } from "@/actions/wishlist.actions"

export interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    lowestPrice: number | null
    productImages: { url: string; altText: string | null }[]
  }
  itemColors: { id: string; hexCode: string }[]
  itemSizes: { id: string; name: string }[]
  priority?: boolean
  initialIsWishlisted?: boolean
  isFirstInGrid?: boolean
}

export function ProductCard({ product, itemColors, itemSizes, priority = false, initialIsWishlisted = false, isFirstInGrid = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(initialIsWishlisted)
  const [isPending, startTransition] = React.useTransition()
  // We want at least the first image, up to all images
  const images = product.productImages || []

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isPending) return

    // Optimistic update
    setIsWishlisted(!isWishlisted)

    startTransition(async () => {
      const res = await toggleWishlistByProductIdAction(product.id)
      if (!res.success) {
        // Revert on failure (e.g. not logged in)
        setIsWishlisted((prev) => !prev)
      } else if (res.data) {
        // Sync with server state
        setIsWishlisted(res.data.wishlisted)
      }
    })
  }
  
  return (
    <Link 
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-2.5 text-left w-full relative"
    >
      {/* Visual Card Image container */}
      <div className="relative w-full aspect-[3/4] bg-surface-secondary overflow-hidden select-none">
        {images.length > 0 ? (
          <div className="w-full h-full relative">
            <Image 
              src={images[0].url} 
              alt={images[0].altText || product.name} 
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              className={`object-cover object-top transition-all duration-700 ease-out md:group-hover:scale-105 ${
                images[1] ? "opacity-100 md:group-hover:opacity-0" : ""
              }`}
            />
            {images[1] && (
              <Image 
                src={images[1].url} 
                alt={images[1].altText || `${product.name} lifestyle`} 
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-top absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-all duration-700 ease-out scale-100 md:group-hover:scale-105"
              />
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-text-secondary uppercase">
            No Image
          </div>
        )}

        {/* Color dot selectors overlay in top-left corner */}
        {itemColors.length > 0 && (
          <div className="absolute top-3 left-3 flex gap-1 z-10">
            {itemColors.map((color: any) => (
              <span 
                key={color.id} 
                className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm"
                style={{ backgroundColor: color.hexCode }}
              />
            ))}
          </div>
        )}

        {/* Wishlist Button (Bottom Right) */}
        <button
          onClick={handleWishlist}
          disabled={isPending}
          className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm text-text-primary hover:bg-white hover:scale-110 transition-all disabled:opacity-70 disabled:hover:scale-100"
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-accent text-accent" : ""}`} />
        </button>
      </div>

      {/* Product details row */}
      <div className="flex flex-col gap-1 px-4 mb-2">
        <div className="flex items-center justify-between text-[10px] tracking-wider text-text-primary">
          <span className="lowercase truncate font-sans text-text-primary font-medium max-w-[72%]">
            {product.name.toLowerCase()}
          </span>
          <span className="font-semibold select-none whitespace-nowrap font-mono text-text-primary">
            {product.lowestPrice !== null && product.lowestPrice !== undefined
              ? `NPR ${Math.round(product.lowestPrice / 100).toLocaleString()}`
              : "Contact for Price"}
          </span>
        </div>

        {/* Removed itemSizes display per user request */}
      </div>
    </Link>
  )
}
