"use client"

import { useState, useMemo, useTransition, useEffect } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { AddToCartButton } from "@/features/cart/components/AddToCartButton"
import { Button } from "@/components/ui/button"
import { Heart, X, ShoppingBag } from "lucide-react"
import { toggleWishlistAction } from "@/actions/wishlist.actions"
import { addToCartAction } from "@/actions/cart.actions"
import { useHeaderState } from "@/providers/header-state-provider"
import { NotifyMeButton } from "./NotifyMeButton"

interface Variant {
  id: string
  color: { id: string; name: string; hexCode?: string } | null
  size: { id: string; name: string; abbreviation: string | null } | null
  inventory: { quantity: number } | null
  isActive: boolean
  price?: number | null
  compareAtPrice?: number | null
}

interface ProductVariantSelectorProps {
  productId: string
  variants: Variant[]
  colors: { id: string; name: string; hexCode?: string }[]
  sizes: { id: string; name: string; abbreviation: string | null }[]
  productName: string
  sizeGuide?: string | null
  shortDescription?: string | null
  initialWishlistVariantIds?: string[]
  offSection?: { originalPrice: number; sellingPrice: number; isOffEnabled: boolean } | null
}

// ── Size Guide Modal ────────────────────────────────────────────────────────
function SizeGuideModal({ sizeGuide, onClose }: { sizeGuide: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-background border border-border max-w-md w-full mx-4 p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close size guide"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-[11px] font-bold tracking-[0.25em] text-text-primary uppercase mb-5">
          Size Guide
        </h3>

        <div className="text-body-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
          {sizeGuide}
        </div>
      </div>
    </div>
  )
}

function WishlistButton({
  variantId,
  disabled,
  isWishlisted,
  onToggle,
  isPending,
}: {
  variantId: string
  disabled: boolean
  isWishlisted: boolean
  onToggle: () => void
  isPending: boolean
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled || isPending}
      aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      className="w-12 h-12 flex-shrink-0 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
    >
      <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-accent text-accent" : ""}`} />
    </button>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────
export function ProductVariantSelector({
  productId,
  variants,
  colors,
  sizes,
  productName,
  sizeGuide,
  shortDescription,
  initialWishlistVariantIds = [],
  offSection,
}: ProductVariantSelectorProps) {
  const [selectedColorId, setSelectedColorId] = useState<string | null>(colors[0]?.id || null)
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [wishlistIds, setWishlistIds] = useState<string[]>(initialWishlistVariantIds)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const { wishlistIds: sharedWishlistIds } = useHeaderState()

  const handleSizeSelect = (sizeId: string) => {
    setSelectedSizeId(sizeId)
    setValidationError(null)
  }

  useEffect(() => {
    if (sharedWishlistIds.length > 0) {
      setWishlistIds(sharedWishlistIds)
    }
  }, [sharedWishlistIds])

  const activeVariant = useMemo(() => {
    if (!selectedSizeId) return undefined
    return variants.find((v) => {
      const colorMatches = v.color ? v.color.id === selectedColorId : true
      const sizeMatches = v.size ? v.size.id === selectedSizeId : true
      return colorMatches && sizeMatches
    })
  }, [variants, selectedColorId, selectedSizeId])

  const displayPrice = useMemo(() => {
    const offEnabled = offSection?.isOffEnabled === true
    if (offEnabled) {
      return `NPR ${Math.round(offSection!.sellingPrice / 100).toLocaleString()}`
    }
    const targetForPrice = activeVariant || variants[0]
    if (targetForPrice && targetForPrice.price !== undefined && targetForPrice.price !== null) {
      return `NPR ${Math.round(targetForPrice.price / 100).toLocaleString()}`
    }
    return "Contact for Price"
  }, [activeVariant, variants, offSection])

  const priceInfo = useMemo(() => {
    const offEnabled = offSection?.isOffEnabled === true
    if (offEnabled) {
      const sellingPrice = offSection!.sellingPrice
      const originalPrice = offSection!.originalPrice
      const discountPercent = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      return { sellingPrice, originalPrice, discountPercent, isOffEnabled: true }
    }

    const targetForPrice = activeVariant || variants[0]
    if (!targetForPrice || targetForPrice.price === undefined || targetForPrice.price === null) {
      return { sellingPrice: null, originalPrice: null, discountPercent: 0, isOffEnabled: false }
    }
    const sellingPrice = targetForPrice.price
    const originalPrice = targetForPrice.compareAtPrice ?? null
    let discountPercent = 0
    if (originalPrice && originalPrice > sellingPrice) {
      discountPercent = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
    }
    return { sellingPrice, originalPrice, discountPercent, isOffEnabled: false }
  }, [activeVariant, variants, offSection])

  const handleWishlistToggle = () => {
    const targetVariant = variants[0]
    if (!targetVariant) return
    const vId = targetVariant.id
    const currentlyWishlisted = wishlistIds.includes(vId)

    // Optimistic toggle
    if (currentlyWishlisted) {
      setWishlistIds((prev) => prev.filter((id) => id !== vId))
    } else {
      setWishlistIds((prev) => [...prev, vId])
    }

    startTransition(async () => {
      const res = await toggleWishlistAction(vId)
      if (!res.success) {
        // Revert on error
        if (currentlyWishlisted) {
          setWishlistIds((prev) => [...prev, vId])
        } else {
          setWishlistIds((prev) => prev.filter((id) => id !== vId))
        }

        // Redirect to login if user is not authenticated
        if (res.error?.code === "UNAUTHORIZED" || res.error?.message?.toLowerCase().includes("auth")) {
          router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
        }
      } else if (res.data) {
        // Sync with verified database response
        const isNowWishlisted = res.data.wishlisted
        if (isNowWishlisted) {
          setWishlistIds((prev) => prev.includes(vId) ? prev : [...prev, vId])
        } else {
          setWishlistIds((prev) => prev.filter((id) => id !== vId))
        }
      }
    })
  }

  const inStock = activeVariant?.inventory ? activeVariant.inventory.quantity > 0 : true

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Size Guide Modal */}
      {sizeGuideOpen && sizeGuide && (
        <SizeGuideModal sizeGuide={sizeGuide} onClose={() => setSizeGuideOpen(false)} />
      )}

      {/* Price */}
      <div className="text-[1.5rem] font-sans font-light tracking-wide select-none -mt-4 border-b border-border/10 pb-3">
        {priceInfo.sellingPrice !== null ? (
          priceInfo.isOffEnabled ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="line-through text-base font-normal" style={{ color: '#9A9A9A' }}>
                  NPR {Math.round(priceInfo.originalPrice! / 100).toLocaleString()}
                </span>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>
                  NPR {Math.round(priceInfo.sellingPrice / 100).toLocaleString()}
                </span>
                <span className="font-semibold text-xs px-2.5 py-0.5 text-white rounded-xs select-none" style={{ backgroundColor: '#D92D20' }}>
                  -{priceInfo.discountPercent}% OFF
                </span>
              </div>
              <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                You Save NPR {Math.round((priceInfo.originalPrice! - priceInfo.sellingPrice) / 100).toLocaleString()}
              </div>
            </div>
          ) : priceInfo.originalPrice && priceInfo.discountPercent > 0 ? (
            <div className="flex items-center gap-3">
              <span className="line-through text-base font-normal" style={{ color: '#9A9A9A' }}>
                NPR {Math.round(priceInfo.originalPrice / 100).toLocaleString()}
              </span>
              <span className="font-medium" style={{ color: '#1A1A1A' }}>
                NPR {Math.round(priceInfo.sellingPrice / 100).toLocaleString()}
              </span>
              <span className="font-semibold text-xs px-2 py-0.5 text-white rounded-sm select-none" style={{ backgroundColor: '#D92D20' }}>
                -{priceInfo.discountPercent}% OFF
              </span>
            </div>
          ) : (
            <span className="text-text-primary">{displayPrice}</span>
          )
        ) : (
          <span className="text-text-primary">{displayPrice}</span>
        )}
      </div>

      {/* Short Description */}
      {shortDescription && (
        <p className="text-[16px] leading-[1.7] text-neutral-700 max-w-[600px] line-clamp-3 select-text font-light text-pretty -mt-2">
          {shortDescription}
        </p>
      )}



      {/* Sizes — circular buttons with Size Guide link */}
      {sizes.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase select-none">
              Size
            </span>
            {sizeGuide && (
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase underline underline-offset-2 hover:text-text-primary transition-colors select-none"
              >
                Size Guide
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Select Size">
            {sizes.map((size) => {
              const isSelected = size.id === selectedSizeId
              const matchingVariants = variants.filter(v => v.size?.id === size.id)
              const isSoldOut = matchingVariants.length > 0 && matchingVariants.every(v => !v.inventory || v.inventory.quantity <= 0)

              return (
                <button
                  key={size.id}
                  onClick={() => handleSizeSelect(size.id)}
                  aria-pressed={isSelected}
                  title={isSoldOut ? `${size.name} — Sold Out` : size.name}
                  className={`w-11 h-11 flex items-center justify-center text-[11px] font-semibold uppercase rounded-full border transition-all select-none relative overflow-hidden ${
                    isSelected
                      ? "border-text-primary bg-text-primary text-surface font-bold"
                      : isSoldOut
                        ? "border-border/30 text-text-secondary/50 bg-neutral-100/50 hover:border-neutral-400"
                        : "border-border/40 text-text-secondary hover:text-text-primary hover:border-text-primary"
                  }`}
                >
                  <span>{size.abbreviation || size.name}</span>
                  {isSoldOut && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-[130%] h-[1.5px] bg-neutral-400/80 -rotate-45" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Availability */}
      {!inStock && (
        <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase select-none">
          Out of Stock
        </span>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <p className="text-body-xs font-semibold text-red-500 text-center select-none animate-pulse">
          {validationError}
        </p>
      )}

      {/* Actions — ADD TO BAG, WISHLIST, and BUY NOW grouped with tighter vertical gap */}
      <div className="flex flex-col gap-2.5 w-full pt-2">
        {!inStock ? (
          <div className="flex flex-col gap-3 w-full">
            <NotifyMeButton productId={productId} variant="full" />
            
            {/* Wishlist Button alongside */}
            <div className="w-full flex justify-end">
              {variants[0] ? (
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={isPending}
                  className="w-full h-12 border border-border flex items-center justify-center text-text-primary uppercase tracking-widest text-[11px] gap-2 font-bold hover:bg-neutral-50 transition-colors"
                >
                  <Heart className={`w-4 h-4 transition-colors ${wishlistIds.includes(variants[0].id) ? "fill-accent text-accent" : ""}`} />
                  {wishlistIds.includes(variants[0].id) ? "Wishlisted" : "Add to Wishlist"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full h-12 border border-border flex items-center justify-center text-text-secondary opacity-40 uppercase tracking-widest text-[11px] gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Wishlist Unavailable
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-stretch gap-3 w-full">
              <div className="flex-1">
                {activeVariant ? (
                  <AddToCartButton variantId={activeVariant.id} inStock={inStock} />
                ) : (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full bg-text-primary border-text-primary text-surface hover:bg-text-primary/90 hover:border-text-primary/90 active:scale-[0.98] transition-all duration-300"
                    onClick={() => setValidationError("Please select a size first.")}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Add to Bag
                    </span>
                  </Button>
                )}
              </div>

              {variants[0] ? (
                <WishlistButton
                  variantId={variants[0].id}
                  disabled={false}
                  isWishlisted={wishlistIds.includes(variants[0].id)}
                  isPending={isPending}
                  onToggle={handleWishlistToggle}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-12 h-12 flex-shrink-0 border border-border flex items-center justify-center text-text-secondary opacity-40"
                  aria-label="Add to Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Buy Now Button — Full-width */}
            <div className="w-full">
              {activeVariant ? (
                <BuyNowButton variantId={activeVariant.id} inStock={inStock} />
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-12 text-black border-black/20 hover:border-black/50 hover:bg-neutral-50 transition-colors uppercase tracking-widest text-[11px]"
                  onClick={() => setValidationError("Please select a size first.")}
                >
                  Buy Now
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function BuyNowButton({ variantId, inStock }: { variantId: string; inStock: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append("variantId", variantId)
      formData.append("quantity", "1")
      
      const res = await addToCartAction(null, formData)
      if (res.success) {
        window.dispatchEvent(new Event("cart-updated"))
        router.push("/checkout")
      } else {
        alert(res.error?.message || "Failed to initiate buy now")
      }
    })
  }

  return (
    <form onSubmit={handleBuyNow} className="w-full">
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={!inStock || isPending}
        className="w-full"
      >
        {isPending ? "Processing..." : "Buy Now"}
      </Button>
    </form>
  )
}
