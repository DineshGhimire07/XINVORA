import Link from "next/link"
import { ShoppingBag, Heart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export interface WishlistItem {
  id: string
  price: number | null
  variant: {
    id: string
    sku: string
    product: {
      id: string
      name: string
      slug: string
    }
    color: { name: string } | null
    size: { name: string } | null
    images: { url: string; altText: string | null }[]
  }
}

interface WishlistCardProps {
  item: WishlistItem
  loading: boolean
  onRemove: (itemId: string) => void
  onAddToCart: (variantId: string, itemId: string) => void
}

export function WishlistCard({ item, loading, onRemove, onAddToCart }: WishlistCardProps) {
  const displayImage = item.variant.images[0]?.url || "https://placehold.co/300x400?text=No+Image"
  const formattedPrice = item.price ? formatCurrency(item.price) : "Contact for Price"
  
  // Format Size • Color subtext
  const specs = [
    item.variant.size?.name,
    item.variant.color?.name
  ].filter(Boolean).join(" • ")

  return (
    <div className="group relative flex flex-col justify-between bg-white border border-[#ECE7DF] rounded-lg overflow-hidden hover:shadow-sm transition-all duration-300">
      <div>
        {/* Aspect Ratio Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F8F6F2]">
          <Link href={`/products/${item.variant.product.slug}`} className="block w-full h-full">
            <img
              src={displayImage}
              alt={item.variant.product.name}
              className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Wishlist Heart Toggle (Top Right - Transparent Outline style) */}
          <button
            onClick={() => onRemove(item.id)}
            disabled={loading}
            className="absolute top-4 right-4 text-text-primary hover:text-accent active:scale-95 transition-all duration-300 disabled:opacity-50"
            aria-label="Remove from wishlist"
          >
            <Heart className="w-5 h-5 stroke-[1.5] fill-none hover:fill-accent/20 transition-all" />
          </button>
        </div>

        {/* Product Information */}
        <div className="p-4 space-y-1 text-left">
          <h3 className="text-body-sm font-medium text-text-primary line-clamp-2 h-10 leading-snug">
            <Link href={`/products/${item.variant.product.slug}`} className="hover:underline">
              {item.variant.product.name}
            </Link>
          </h3>
          {specs && (
            <p className="text-[10px] text-[#757575] font-light truncate">
              {specs}
            </p>
          )}
          <p className="text-body-sm font-bold text-text-primary pt-0.5">
            {formattedPrice}
          </p>
        </div>
      </div>

      {/* Grid Bottom Action Panel */}
      <div className="p-4 pt-0 flex flex-col items-center gap-2">
        <button
          onClick={() => onAddToCart(item.variant.id, item.id)}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 text-[10px] tracking-wider uppercase font-semibold rounded-none transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Add To Cart</span>
        </button>

        {/* Small Close Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={loading}
          className="text-[9px] uppercase tracking-widest text-[#757575] hover:text-[#c2410c] transition-colors duration-200 py-1 flex items-center gap-0.5 disabled:opacity-50"
        >
          <span>×</span> Remove
        </button>
      </div>
    </div>
  )
}
