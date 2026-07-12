import { NextResponse } from "next/server"
import { SessionService } from "@/services/session.service"
import { getHeaderCommerceState } from "@/db/queries/cart"
import { getWishlistVariantIds } from "@/db/queries/wishlist"
import { ProfileService } from "@/services/profile.service"
import { unstable_cache } from "next/cache"

const getHeaderStateCached = unstable_cache(
  async (userId: string, sessionId: string) => {
    const resolvedUserId = userId === "none" ? null : userId
    const resolvedSessionId = sessionId === "none" ? null : sessionId

    const [cart, wishlistIds, account] = await Promise.all([
      getHeaderCommerceState(resolvedUserId, resolvedSessionId),
      resolvedUserId ? getWishlistVariantIds(resolvedUserId) : Promise.resolve([]),
      resolvedUserId ? ProfileService.getProfile(resolvedUserId).catch(() => null) : Promise.resolve(null),
    ])

    return {
      cart,
      wishlist: {
        items: wishlistIds.map((id) => ({
          variant: { id }
        }))
      },
      account
    }
  },
  ["commerce-header-state"],
  { revalidate: 3 }
)

export async function GET() {
  const { userId, sessionId } = await SessionService.getCommerceIdentity()
  const data = await getHeaderStateCached(userId || "none", sessionId || "none")
  return NextResponse.json(data)
}
