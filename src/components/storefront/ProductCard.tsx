"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { toggleWishlistByProductIdAction } from "@/actions/wishlist.actions"
import { NotifyMeButton } from "@/components/storefront/NotifyMeButton"

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
    <Link 
      href={`/products/${product.slug}`}
      prefetch={false}
      onMouseEnter={() => router.prefetch(`/products/${product.slug}`)}
      onFocus={() => router.prefetch(`/products/${product.slug}`)}
      className="group flex flex-col gap-2.5 text-left w-full relative"
    >
      {/* Visual Card Image container */}
      <div className="relative w-full aspect-[3/4] bg-surface-secondary overflow-hidden select-none">
        {overrideImage ? (
          <div className="w-full h-full relative">
            <Image 
              src={overrideImage} 
              alt={product.name} 
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              priority={priority}
              className={objectContain ? "object-contain p-2" : "object-cover object-top"}
            />
          </div>
        ) : images.length > 0 ? (
          <>
            {/* Desktop Hover State (Hidden on touch devices, shown on hover on desktop) */}
            <div className="hidden md:block w-full h-full relative">
              <Image 
                src={images[0].url} 
                alt={images[0].altText || product.name} 
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={priority}
                className={`${
                  objectContain ? "object-contain p-2" : "object-cover object-top"
                } transition-all duration-700 ease-out ${
                  !disableHover && images[1] ? "opacity-100 group-hover:opacity-0" : ""
                }`}
              />
              {!disableHover && images[1] && (
                <Image 
                  src={images[1].url} 
                  alt={images[1].altText || `${product.name} lifestyle`} 
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={`${
                    objectContain ? "object-contain p-2" : "object-cover object-top"
                  } absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out`}
                />
              )}
            </div>

            {/* Mobile Scrollable Carousel (Visible on mobile, hidden on desktop, touch-auto to prevent scroll locking) */}
            {disableHover ? (
              <div className="flex md:hidden w-full h-full relative">
                <Image 
                  src={images[0].url} 
                  alt={images[0].altText || product.name} 
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority={priority}
                  className={objectContain ? "object-contain p-2" : "object-cover object-top"}
                />
              </div>
            ) : (
              <div 
                className="flex md:hidden w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory touch-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {images.map((img, i) => (
                  <div key={i} className="relative w-full h-full shrink-0 snap-center">
                    <Image
                      src={img.url}
                      alt={img.altText || `${product.name} ${i + 1}`}
                      fill
                      sizes="50vw"
                      priority={priority && i === 0}
                      className={objectContain ? "object-contain p-2" : "object-cover object-top"}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Slide Indicator for mobile (only show if multiple images) */}
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

        {/* Sold Out badge on top-left of image wrapper */}
        {!inStock && (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[8px] font-bold tracking-[0.25em] uppercase bg-neutral-900 text-white select-none">
            Sold Out
          </span>
        )}

        {/* Sale discount badge */}
        {inStock && discountPercent > 0 && !hideDiscountBadge && (
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
        )}

        {/* Color dot selectors overlay in top-left corner (only shown if not sold out to prevent collision) */}
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
            className="absolute bottom-4 right-4 z-20 flex items-center justify-center text-text-primary hover:scale-110 transition-all disabled:opacity-70 disabled:hover:scale-100"
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-accent text-accent" : ""}`} />
          </button>
        )}
      </div>

      {/* Product details row */}
      {(!hideName || !hidePrice || !inStock) && (
        <div className="flex flex-col gap-1 px-4 mb-2">
          {(!hideName || !hidePrice) && (
            <div className="flex items-center justify-between text-[10px] tracking-wider text-text-primary">
              {!hideName && (
                <span className="lowercase truncate font-sans text-text-primary font-medium max-w-[72%]">
                  {product.name.toLowerCase()}
                </span>
              )}
              {!hidePrice && (
                <span className="flex items-center gap-3.5 select-none whitespace-nowrap font-mono">
                  {(effectiveSellingPrice !== null && effectiveSellingPrice !== undefined) ? (
                    effectiveOriginalPrice && discountPercent > 0 ? (
                      <>
                        <span className="line-through font-normal text-[10px]" style={{ color: '#9A9A9A' }}>
                          NPR {Math.round(effectiveOriginalPrice / 100).toLocaleString()}
                        </span>
                        <span className="font-semibold text-[11px]" style={{ color: '#1A1A1A' }}>
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
          {!inStock && (
            <div 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
              }} 
              className="mt-2.5 w-full relative z-30"
            >
              <NotifyMeButton productId={product.id} variant="inline" />
            </div>
          )}
        </div>
      )}
    </Link>
  )
}
