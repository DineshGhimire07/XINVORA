"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { optimizeCloudinaryUrl } from "@/lib/image-optimizer"
import { formatCardDisplayTitle } from "@/lib/utils"

export interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    lowestPrice: number | null
    compareAtPrice?: number | null
    offSection?: { originalPrice: number; sellingPrice: number; isOffEnabled: boolean } | null
    productImages: { url: string; altText: string | null }[]
  }
  itemColors?: { id: string; hexCode: string }[]
  itemSizes?: { id: string; name: string }[]
  priority?: boolean
  initialIsWishlisted?: boolean
  isFirstInGrid?: boolean
  hideWishlist?: boolean
  hidePrice?: boolean
  hideName?: boolean
  hideDiscountBadge?: boolean
  overrideImage?: string | null
  disableHover?: boolean
  objectContain?: boolean
  inStock?: boolean
  hideDots?: boolean
}

export function ProductCard({
  product,
  priority = false,
  overrideImage = null,
  disableHover = false,
  inStock = true,
}: ProductCardProps) {
  const [isDesktopHovered, setIsDesktopHovered] = React.useState(false)
  const images = product.productImages || []

  // Pricing calculations
  const offEnabled = product.offSection?.isOffEnabled === true
  const effectiveOriginalPrice = offEnabled ? product.offSection!.originalPrice : product.compareAtPrice
  const effectiveSellingPrice = offEnabled ? product.offSection!.sellingPrice : product.lowestPrice

  const sellingPriceFormatted =
    effectiveSellingPrice !== null && effectiveSellingPrice !== undefined
      ? Math.round(effectiveSellingPrice / 100).toLocaleString()
      : null

  const originalPriceFormatted =
    effectiveOriginalPrice &&
    effectiveSellingPrice &&
    effectiveOriginalPrice > effectiveSellingPrice
      ? Math.round(effectiveOriginalPrice / 100).toLocaleString()
      : null

  // Editorial concise display title for the card
  const cardTitle = formatCardDisplayTitle(product.name)

  const primaryImageSrc = overrideImage || images[0]?.url || null
  const secondaryImageSrc = !disableHover && images[1]?.url ? images[1].url : null

  return (
    <div
      data-product-card
      className="group relative flex flex-col w-full rounded-lg md:rounded-xl overflow-hidden bg-[#2C1921] shadow-[0_4px_16px_rgba(44,25,33,0.08)] hover:shadow-[0_8px_24px_rgba(44,25,33,0.15)] transition-all duration-300 hover:-translate-y-0.5 select-none"
    >
      {/* Click target wrapping the entire card */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-30"
        aria-label={product.name}
      />

      {/* SECTION A — PRODUCT IMAGE (Strict 1:1 Aspect Ratio) */}
      <div
        className="relative w-full aspect-square overflow-hidden bg-neutral-200"
        onMouseEnter={() => setIsDesktopHovered(true)}
        onMouseLeave={() => setIsDesktopHovered(false)}
      >
        {primaryImageSrc ? (
          <>
            <Image
              src={optimizeCloudinaryUrl(primaryImageSrc, { width: 800 })}
              alt={images[0]?.altText || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              fetchPriority={priority ? "high" : "low"}
              loading={priority ? "eager" : "lazy"}
              className={`object-cover object-center pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105 ${
                secondaryImageSrc && isDesktopHovered ? "opacity-0" : "opacity-100"
              }`}
            />

            {secondaryImageSrc && (
              <Image
                src={optimizeCloudinaryUrl(secondaryImageSrc, { width: 800 })}
                alt={images[1]?.altText || `${product.name} lifestyle`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                fetchPriority="low"
                className={`object-cover object-center pointer-events-none absolute inset-0 transition-all duration-700 ease-out group-hover:scale-105 ${
                  isDesktopHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 uppercase select-none">
            No Image
          </div>
        )}

        {/* Soft, gentle gradient: starts lower down (h-14) so the photo stays bright and feminine */}
        <div className="absolute inset-x-0 bottom-0 h-14 sm:h-16 bg-gradient-to-b from-transparent via-[#2C1921]/40 to-[#2C1921] pointer-events-none z-10" />
      </div>

      {/* SECTION B — GRADIENT + PRODUCT INFORMATION (Extends below 1:1 photo) */}
      <div className="relative w-full bg-[#2C1921] px-3 pb-3.5 pt-0.5 sm:px-4 sm:pb-4 sm:pt-1 z-20 flex flex-col justify-end">
        {/* Product Name: Delicate serif typography in soft rose-white */}
        <h3 className="font-serif text-[#FFF5F7] text-[13.5px] sm:text-[15.5px] font-light leading-snug line-clamp-1 drop-shadow-xs">
          {cardTitle}
        </h3>

        {/* Pricing & Status Row */}
        <div className="flex items-center justify-between gap-2 mt-1 w-full">
          <div className="flex items-baseline gap-2 min-w-0">
            {sellingPriceFormatted ? (
              <>
                <span className="font-semibold text-white text-[14.5px] sm:text-[16px] tracking-tight whitespace-nowrap">
                  NPR {sellingPriceFormatted}
                </span>
                {originalPriceFormatted && (
                  <span className="line-through text-[#E8C2CC]/60 text-xs sm:text-[12.5px] font-normal whitespace-nowrap">
                    NPR {originalPriceFormatted}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[#FFF5F7]/80 text-xs">Contact for Price</span>
            )}
          </div>

          {/* Sold Out badge: Delicate pastel blush pink pill */}
          {!inStock && (
            <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide bg-[#FCE5EB] text-[#7A283C] border border-[#F5BAC7]/60 shadow-xs select-none">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
