import { NextResponse } from "next/server"
import { SessionService } from "@/services/session.service"
import { getHeaderCommerceState } from "@/db/queries/cart"
import { getWishlist } from "@/db/queries/wishlist"
import { ProfileService } from "@/services/profile.service"
import { unstable_cache } from "next/cache"

const getHeaderStateCached = unstable_cache(
  async (userId: string, sessionId: string) => {
    const resolvedUserId = userId === "none" ? null : userId
    const resolvedSessionId = sessionId === "none" ? null : sessionId

    const [cart, wishlist, account] = await Promise.all([
      getHeaderCommerceState(resolvedUserId, resolvedSessionId),
      resolvedUserId ? getWishlist(resolvedUserId) : Promise.resolve(null),
      resolvedUserId ? ProfileService.getProfile(resolvedUserId) : Promise.resolve(null),
    ])

    return { cart, wishlist, account }
  },
  ["commerce-header-state"],
  { revalidate: 3 }
)

export async function GET() {
  const { userId, sessionId } = await SessionService.getCommerceIdentity()
  const data = await getHeaderStateCached(userId || "none", sessionId || "none")
  return NextResponse.json(data)
}
