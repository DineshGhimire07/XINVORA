import { NextRequest, NextResponse } from "next/server"
import { SessionService } from "@/services/session.service"
import { getWishlist } from "@/db/queries/wishlist"

export async function GET(request: NextRequest) {
  const session = await SessionService.optionalAuth()
  if (!session) {
    return NextResponse.json({ wishlistedVariantIds: [] })
  }

  const wishlist = await getWishlist(session.id)
  const wishlistedVariantIds = wishlist?.items?.map((item: any) => item.variant.id) ?? []

  return NextResponse.json({ wishlistedVariantIds })
}
