import { SessionService } from "@/services/session.service"
import { getWishlist } from "@/db/queries/wishlist"
import { Stack } from "@/components/shared/stack"
import { WishlistGrid } from "./WishlistGrid"

export const metadata = {
  title: "My Wishlist | XINVORA",
  description: "View and manage items saved to your wishlist.",
}

export default async function WishlistPage() {
  const session = await SessionService.requireAuth()
  const wishlist = await getWishlist(session.id)

  return (
    <div className="space-y-6">
      <div className="border-b border-border-primary/20 pb-4">
        <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">My Account</span>
        <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-1">My Wishlist</h1>
      </div>

      <WishlistGrid initialItems={wishlist?.items ?? []} />
    </div>
  )
}
