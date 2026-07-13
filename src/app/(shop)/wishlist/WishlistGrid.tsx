import { WishlistCard, WishlistItem } from "./WishlistCard"

interface WishlistGridProps {
  items: WishlistItem[]
  loadingId: string | null
  onRemove: (itemId: string) => void
  onAddToCart: (variantId: string, itemId: string) => void
}

export function WishlistGrid({ items, loadingId, onRemove, onAddToCart }: WishlistGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
      {items.map((item) => (
        <WishlistCard
          key={item.id}
          item={item}
          loading={loadingId === item.id}
          onRemove={onRemove}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
