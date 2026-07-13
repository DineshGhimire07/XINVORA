interface WishlistHeroProps {
  itemCount: number
}

export function WishlistHero({ itemCount }: WishlistHeroProps) {
  return (
    <div className="mb-12 text-left select-none">
      <h1 className="text-display-md font-display uppercase tracking-wide text-text-primary">
        My Wishlist
      </h1>
      <p className="text-overline tracking-widest text-text-secondary mt-1">
        {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
      </p>
    </div>
  )
}
