import Link from "next/link"
import Image from "next/image"
import { WishlistToggleIcon } from "@/components/shop/WishlistToggleIcon"
import { formatCurrency } from "@/lib/utils"
import type { ProductSummary } from "@/db/queries/types"

interface WishlistRecommendationsProps {
  products: (ProductSummary & { lowestPrice?: number | null })[]
}

export function WishlistRecommendations({ products }: WishlistRecommendationsProps) {
  if (!products || products.length === 0) return null

  return (
    <div className="border-t border-[#ECE7DF] pt-16 mt-16 space-y-10">
      {/* Editorial Section Header */}
      <div className="text-left select-none">
        <span className="text-[9px] font-bold tracking-[0.25em] text-[#B79A82] uppercase block">
          Selected For You
        </span>
        <h2 className="text-display-xs font-display text-[#222222] uppercase tracking-wide mt-2">
          Complete Your Wardrobe
        </h2>
      </div>

      {/* 6-Column Layout Grid for Recommendations */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-12">
        {products.map((p) => {
          const displayImage = p.productImages?.[0]?.url || "https://placehold.co/300x400?text=No+Image"
          const formattedPrice = p.lowestPrice !== null && p.lowestPrice !== undefined
            ? formatCurrency(p.lowestPrice)
            : "Contact for Price"

          return (
            <div key={p.id} className="group flex flex-col gap-4 text-left">
              {/* Product Image Wrapper */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F8F6F2] select-none rounded-sm border border-[#ECE7DF]/40">
                <Link href={`/products/${p.slug}`} className="block w-full h-full">
                  <Image
                    src={displayImage}
                    alt={p.productImages?.[0]?.altText || p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 15vw"
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </Link>
                
                {/* Wishlist Toggle Heart Icon positioned relative to image wrapper bottom-right */}
                <div className="absolute bottom-3 right-3 z-10">
                  <WishlistToggleIcon productId={p.id} />
                </div>
              </div>

              {/* Product Information */}
              <Link href={`/products/${p.slug}`} className="flex flex-col gap-1.5 mt-0.5 min-w-0">
                <h3 className="text-[12px] font-medium tracking-wide text-text-primary group-hover:text-text-primary/70 transition-colors duration-200 uppercase truncate">
                  {p.name}
                </h3>
                <span className="font-bold text-[11px] text-[#222222]">
                  {formattedPrice}
                </span>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
