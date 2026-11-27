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
      className="group relative flex flex-col w-full rounded-lg md:rounded-xl overflow-hidden bg-[#FAF6F2] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EDE3DB] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 select-none"
    >
      {/* Click target wrapping the entire card */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-30"
        aria-label={product.name}
      />

      {/* SECTION A — PRODUCT IMAGE (1:1 Square, Top-Aligned so model face appears) */}
      <div
        className="relative w-full aspect-square overflow-hidden bg-neutral-100"
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
              className={`object-cover object-top pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105 ${
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
                className={`object-cover object-top pointer-events-none absolute inset-0 transition-all duration-700 ease-out group-hover:scale-105 ${
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

        {/* Soft, delicate light gradient fading seamlessly into the soft cream base */}
        <div className="absolute inset-x-0 bottom-0 h-10 sm:h-12 bg-gradient-to-b from-transparent via-[#FAF6F2]/50 to-[#FAF6F2] pointer-events-none z-10" />
      </div>

      {/* SECTION B — LIGHT PRODUCT INFORMATION (Soft Warm Cream #FAF6F2) */}
      <div className="relative w-full bg-[#FAF6F2] px-3 pb-3.5 pt-0.5 sm:px-4 sm:pb-4 sm:pt-1 z-20 flex flex-col justify-end">
        {/* Product Name: Elegant serif typography in deep warm espresso */}
        <h3 className="font-serif text-[#221614] text-[13.5px] sm:text-[15.5px] font-normal leading-snug line-clamp-1">
          {cardTitle}
        </h3>

        {/* Pricing & Status Row */}
        <div className="flex items-center justify-between gap-2 mt-1 w-full">
          <div className="flex items-baseline gap-2 min-w-0">
            {sellingPriceFormatted ? (
              <>
                <span className="font-bold text-[#1A110F] text-[14.5px] sm:text-[16px] tracking-tight whitespace-nowrap">
                  NPR {sellingPriceFormatted}
                </span>
                {originalPriceFormatted && (
                  <span className="line-through text-[#8C7A72] text-xs sm:text-[12.5px] font-normal whitespace-nowrap">
                    NPR {originalPriceFormatted}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[#8C7A72] text-xs">Contact for Price</span>
            )}
          </div>

          {/* Sold Out badge: Delicate muted warm blush pill */}
          {!inStock && (
            <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide bg-[#EFE3DB] text-[#5C453B] border border-[#DDD0C6] shadow-xs select-none">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
