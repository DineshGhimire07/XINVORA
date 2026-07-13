interface WishlistToolbarProps {
  itemCount: number
  sortBy: string
  onSortChange: (val: string) => void
}

export function WishlistToolbar({ itemCount, sortBy, onSortChange }: WishlistToolbarProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#ECE7DF] mb-8">
      {/* Item Count */}
      <span className="text-[11px] font-bold tracking-wider text-[#222222] uppercase">
        {itemCount} {itemCount === 1 ? "Item" : "Items"}
      </span>

      {/* Sort Select */}
      <div className="flex items-center gap-2">
        <label htmlFor="wishlist-sort" className="text-[10px] font-bold tracking-widest text-[#757575] uppercase">
          Sort By:
        </label>
        <select
          id="wishlist-sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-transparent text-[11px] uppercase tracking-wider font-semibold text-[#222222] border border-[#ECE7DF] px-3 py-1.5 focus:outline-none focus:border-[#B79A82] cursor-pointer"
        >
          <option value="recently-added">Recently Added</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  )
}
