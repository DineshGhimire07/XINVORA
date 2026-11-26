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
      className="group relative flex flex-col w-full rounded-2xl md:rounded-[22px] overflow-hidden bg-[#352319] shadow-[0_4px_20px_rgba(40,25,18,0.12)] hover:shadow-[0_8px_30px_rgba(40,25,18,0.22)] transition-all duration-300 hover:-translate-y-1 select-none"
    >
      {/* Click target wrapping the entire card */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-30"
        aria-label={product.name}
      />

      {/* SECTION A — PRODUCT IMAGE (Strict 1:1 Aspect Ratio) */}
      <div
        className="relative w-full aspect-square overflow-hidden bg-[#2D1C14]"
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

        {/* 
          Seamless, warm mocha gradient:
          Uses identical RGB (53, 35, 25) with smooth alpha progression.
          This completely prevents greyish-muddy dead zones or harsh banding lines.
        */}
        <div
          className="absolute inset-x-0 bottom-0 h-36 sm:h-44 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(53, 35, 25, 0) 0%, rgba(53, 35, 25, 0.08) 25%, rgba(53, 35, 25, 0.45) 55%, rgba(53, 35, 25, 0.85) 85%, #352319 100%)",
          }}
        />
      </div>

      {/* SECTION B — EXTENDED PRODUCT INFORMATION (Warm Mocha Base #352319) */}
      <div className="relative w-full bg-[#352319] px-3.5 pb-4 pt-1 sm:px-4 sm:pb-4.5 sm:pt-1.5 z-20 flex flex-col justify-end">
        {/* Product Name: Elegant serif typography in crisp white */}
        <h3 className="font-serif text-white text-[15px] sm:text-[17px] font-normal leading-snug line-clamp-1 drop-shadow-xs">
          {cardTitle}
        </h3>

        {/* Pricing & Status Row */}
        <div className="flex items-center justify-between gap-2 mt-1.5 w-full">
          <div className="flex items-baseline gap-2 sm:gap-2.5 min-w-0">
            {sellingPriceFormatted ? (
              <>
                <span className="font-bold text-white text-[15px] sm:text-[17px] tracking-tight whitespace-nowrap">
                  NPR {sellingPriceFormatted}
                </span>
                {originalPriceFormatted && (
                  <span className="line-through text-white/55 text-xs sm:text-[13px] font-normal whitespace-nowrap">
                    NPR {originalPriceFormatted}
                  </span>
                )}
              </>
            ) : (
              <span className="text-white/80 text-xs">Contact for Price</span>
            )}
          </div>

          {/* Sold Out badge: Delicate warm sand pill from reference mockup */}
          {!inStock && (
            <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide bg-[#D8C7B5] text-[#332219] shadow-xs select-none">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
