"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { toggleWishlistByProductIdAction } from "@/actions/wishlist.actions"
import { useHeaderState } from "@/providers/header-state-provider"

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
  itemColors: { id: string; hexCode: string }[]
  itemSizes: { id: string; name: string }[]
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
}

import { optimizeCloudinaryUrl, SHIMMER_BLUR_DATA_URL } from "@/lib/image-optimizer"

export function ProductCard({
  product,
  itemColors,
  itemSizes,
  priority = false,
  initialIsWishlisted = false,
  isFirstInGrid = false,
  hideWishlist = false,
  hidePrice = false,
  hideName = false,
  hideDiscountBadge = false,
  overrideImage = null,
  disableHover = false,
  objectContain = false,
  inStock = true,
}: ProductCardProps) {
  const router = useRouter()
  const { cartItemMap } = useHeaderState()
  const inCartQty = cartItemMap.get(product.id) || 0
  const [isWishlisted, setIsWishlisted] = React.useState(initialIsWishlisted)
  const [isPending, startTransition] = React.useTransition()
  // We want at least the first image, up to all images
  const images = product.productImages || []

  // Calculate discount percentage for sale badge
  // Off Section pricing takes priority over compareAtPrice
  const offEnabled = product.offSection?.isOffEnabled === true
  const effectiveOriginalPrice = offEnabled ? product.offSection!.originalPrice : product.compareAtPrice
  const effectiveSellingPrice = offEnabled ? product.offSection!.sellingPrice : product.lowestPrice

  const discountPercent = React.useMemo(() => {
    if (effectiveOriginalPrice && effectiveSellingPrice && effectiveOriginalPrice > effectiveSellingPrice) {
      return Math.round(((effectiveOriginalPrice - effectiveSellingPrice) / effectiveOriginalPrice) * 100)
    }
    return 0
  }, [effectiveOriginalPrice, effectiveSellingPrice])

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
    <div className={`group flex flex-col text-left w-full relative ${hideName && hidePrice ? "" : "gap-2.5"}`}>
      {/* Visual Card Image container */}
      <div className="relative w-full aspect-[3/4] bg-[#ECEBE7] overflow-hidden select-none">
        <Link 
          href={`/products/${product.slug}`}
          prefetch={false}
          className="absolute inset-0 z-[5]"
          aria-label={product.name}
        />
        {overrideImage ? (
          <div className="w-full h-full relative">
            <Image 
              src={optimizeCloudinaryUrl(overrideImage, { width: 800 })} 
              alt={product.name} 
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              fetchPriority={priority ? "high" : "auto"}
              loading={priority ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL={SHIMMER_BLUR_DATA_URL}
              className="object-cover object-top"
            />
          </div>
        ) : images.length > 0 ? (
          <>
            {/* Desktop Hover State — pointer-events-none so clicks pass to the Link below */}
            <div className="hidden md:block w-full h-full relative pointer-events-none">
              <Image 
                src={optimizeCloudinaryUrl(images[0].url, { width: 800 })} 
                alt={images[0].altText || product.name} 
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                loading={priority ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL={SHIMMER_BLUR_DATA_URL}
                className={`object-cover object-top transition-all duration-700 ease-out ${
                  !disableHover && images[1] ? "opacity-100 group-hover:opacity-0" : ""
                }`}
              />
              {!disableHover && images[1] && (
                <Image 
                  src={optimizeCloudinaryUrl(images[1].url, { width: 800 })} 
                  alt={images[1].altText || `${product.name} lifestyle`} 
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                  decoding="async"
                  className="object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out"
                />
              )}
            </div>

            {/* Mobile Scrollable Carousel */}
            {disableHover ? (
              <div className="flex md:hidden w-full h-full relative pointer-events-none">
                <Image 
                  src={optimizeCloudinaryUrl(images[0].url, { width: 640 })} 
                  alt={images[0].altText || product.name} 
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  priority={priority}
                  fetchPriority={priority ? "high" : "auto"}
                  loading={priority ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL={SHIMMER_BLUR_DATA_URL}
                  className="object-cover object-top"
                />
              </div>
            ) : (
              <div 
                className="flex md:hidden w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory touch-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClick={() => router.push(`/products/${product.slug}`)}
              >
                {images.map((img, i) => (
                  <div key={i} className="relative w-full h-full shrink-0 snap-center">
                    <Image
                      src={optimizeCloudinaryUrl(img.url, { width: 640 })}
                      alt={img.altText || `${product.name} ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      priority={priority && i === 0}
                      fetchPriority={priority && i === 0 ? "high" : "auto"}
                      loading={priority && i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      placeholder="blur"
                      blurDataURL={SHIMMER_BLUR_DATA_URL}
                      className="object-cover object-top"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Slide Indicator for mobile */}
            {!disableHover && images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex md:hidden gap-1.5 z-10 pointer-events-none">
                {images.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm" />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-text-secondary uppercase select-none">
            No Image
          </div>
        )}

        {/* Sold Out / In Bag badge */}
        {!inStock ? (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[8px] font-bold tracking-[0.25em] uppercase bg-text-primary text-background select-none shadow-xs">
            SOLD OUT
          </span>
        ) : inCartQty > 0 ? (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[8px] font-bold tracking-[0.18em] uppercase bg-white/95 text-text-primary border border-neutral-200 shadow-xs select-none">
            IN BAG ({inCartQty})
          </span>
        ) : null}

        {/* Sale discount badge */}
        {inStock && discountPercent > 0 && !hideDiscountBadge && (
          <span className="absolute top-3 right-3 z-10 text-[8px] font-bold tracking-[0.18em] uppercase select-none border border-neutral-300 bg-white/90 text-text-primary px-2 py-0.5 leading-none shadow-xs">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Color dot selectors overlay */}
        {inStock && itemColors.length > 0 && (
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
        {!hideWishlist && (
          <button
            onClick={handleWishlist}
            disabled={isPending}
            className="absolute bottom-3 right-3 z-20 flex items-center justify-center text-text-primary hover:scale-110 transition-all disabled:opacity-70 disabled:hover:scale-100"
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-4.5 h-4.5 transition-colors ${isWishlisted ? "fill-accent text-accent" : "text-neutral-800"}`} />
          </button>
        )}
      </div>

      {/* Product details row */}
      {(!hideName || !hidePrice) && (
        <div className="flex flex-col gap-1 px-0.5 pt-1.5 mb-2">
          {(!hideName || !hidePrice) && (
            <div className="flex items-center justify-between text-[10px] tracking-wider text-text-primary">
              {!hideName && (
                <Link href={`/products/${product.slug}`} className="lowercase truncate font-sans text-text-primary font-medium max-w-[72%] hover:text-text-secondary transition-colors">
                  {product.name.toLowerCase()}
                </Link>
              )}
              {!hidePrice && (
                <span className="flex items-center gap-3.5 select-none whitespace-nowrap font-mono">
                  {(effectiveSellingPrice !== null && effectiveSellingPrice !== undefined) ? (
                    effectiveOriginalPrice && discountPercent > 0 ? (
                      <>
                        <span className="line-through font-normal text-[10px] text-text-tertiary">
                          NPR {Math.round(effectiveOriginalPrice / 100).toLocaleString()}
                        </span>
                        <span className="font-semibold text-[11px] text-text-primary">
                          NPR {Math.round(effectiveSellingPrice / 100).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-text-primary">
                        NPR {Math.round(effectiveSellingPrice / 100).toLocaleString()}
                      </span>
                    )
                  ) : product.lowestPrice !== null && product.lowestPrice !== undefined ? (
                    <span className="font-semibold text-text-primary">
                      NPR {Math.round(product.lowestPrice / 100).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-text-primary">Contact for Price</span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
