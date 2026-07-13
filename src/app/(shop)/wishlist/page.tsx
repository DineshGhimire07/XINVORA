import { Metadata } from "next"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { getWishlist } from "@/db/queries/wishlist"
import { findFeaturedProducts } from "@/db/queries/products"
import { SessionService } from "@/services/session.service"
import { WishlistContainer } from "./WishlistContainer"
import { WishlistRecommendations } from "./WishlistRecommendations"

export const metadata: Metadata = {
  title: "Wishlist | XINVORA",
  description: "curated objects saved for later.",
}

export default async function WishlistPage() {
  const session = await SessionService.optionalAuth()
  
  if (!session) {
    return (
      <Section id="wishlist-signin" className="pt-[120px] md:pt-32 pb-16 bg-[#F8F6F2] min-h-[80vh] flex items-center justify-center">
        <Container>
          <div className="flex flex-col items-center justify-center text-center select-none py-12">
            <div className="w-16 h-16 rounded-full bg-white border border-[#ECE7DF] flex items-center justify-center text-[#CFCFCF] mb-6">
              <Heart className="w-7 h-7 stroke-[1.25]" />
            </div>
            <h1 className="text-display-xs font-display text-[#222222] uppercase tracking-wide mb-2">
              Sign in to view your wishlist
            </h1>
            <p className="text-body-sm text-[#757575] max-w-sm mb-8 leading-relaxed">
              Curate your wishlist and sync it across devices for a faster checkout.
            </p>
            <Link href="/login?callbackUrl=/wishlist">
              <button className="bg-accent hover:bg-accent-hover text-white px-8 py-3 text-[10px] uppercase tracking-widest font-semibold transition-colors duration-300 rounded-none">
                Sign In / Register
              </button>
            </Link>
          </div>
        </Container>
      </Section>
    )
  }

  const [wishlist, recommendedProducts] = await Promise.all([
    getWishlist(session.id),
    findFeaturedProducts(6),
  ])

  return (
    <Section id="wishlist" className="pt-28 pb-12 md:pt-32 md:pb-24 bg-[#F8F6F2] min-h-screen">
      <Container size="full" className="px-6 sm:px-12 md:px-16 lg:px-20">
        {/* Wishlist Main Container */}
        <WishlistContainer initialItems={wishlist?.items ?? []} />

        {/* Selected For You / Recommendations */}
        <WishlistRecommendations products={recommendedProducts} />
      </Container>
    </Section>
  )
}
