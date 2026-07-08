import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Grid } from "@/components/shared/grid"
import { Button } from "@/components/ui/button"
import { getWishlist } from "@/db/queries/wishlist"
import { SessionService } from "@/services/session.service"
import { WishlistButton } from "@/features/wishlist/components/WishlistButton"
import { AddAllToCartButton } from "./AddAllToCartButton"

export const metadata: Metadata = {
  title: "Wishlist | XINVORA",
  description: "View your saved items.",
}

export default async function WishlistPage() {
  const session = await SessionService.optionalAuth()
  
  if (!session) {
    return (
      <Section id="wishlist-empty" padding="2xl" className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Container>
          <h1 className="text-display-md font-display mb-6">Sign in to view your wishlist</h1>
          <p className="text-body-md text-text-secondary mb-8 max-w-md mx-auto">
            You must be logged in to view and manage your saved items.
          </p>
          <Link href="/login?callbackUrl=/wishlist">
            <button className="bg-text-primary text-surface px-8 py-3 text-body-sm font-semibold tracking-widest uppercase hover:bg-text-secondary transition-colors">
              Sign In
            </button>
          </Link>
        </Container>
      </Section>
    )
  }

  const wishlist = await getWishlist(session.id)

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <Section id="wishlist-empty" padding="2xl" className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Container>
          <h1 className="text-display-md font-display mb-6">Your Wishlist is Empty</h1>
          <p className="text-body-md text-text-secondary mb-8 max-w-md mx-auto">
            Save items you love to your wishlist to keep track of them or buy them later.
          </p>
          <Link href="/search">
            <button className="bg-text-primary text-surface px-8 py-3 text-body-sm font-semibold tracking-widest uppercase hover:bg-text-secondary transition-colors">
              Discover Products
            </button>
          </Link>
        </Container>
      </Section>
    )
  }

  return (
    <Section id="wishlist" padding="2xl">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-display-sm font-display uppercase tracking-wide">
            Wishlist
          </h1>
          <AddAllToCartButton />
        </div>

        <Grid cols={{ base: 2, md: 3, lg: 4 }} gap={6}>
          {wishlist.items.map((item) => {
            const primaryImage = item.variant.images[0]
            return (
              <div key={item.id} className="group flex flex-col relative">
                <div className="aspect-[3/4] relative bg-surface overflow-hidden mb-4">
                  {primaryImage && (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.altText || item.variant.product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <WishlistButton 
                      variantId={item.variant.id} 
                      wishlistItemId={item.id}
                      isWishlisted={true} 
                    />
                  </div>
                </div>
                
                <Link href={`/products/${item.variant.product.slug}`} className="hover:underline">
                  <h3 className="text-body-md font-medium text-text-primary">
                    {item.variant.product.name}
                  </h3>
                </Link>
                <div className="text-body-sm text-text-secondary mt-1">
                  {item.variant.color && <span>{item.variant.color.name}</span>}
                  {item.variant.color && item.variant.size && <span> | </span>}
                  {item.variant.size && <span>{item.variant.size.name}</span>}
                </div>
                <div className="text-body-md text-text-primary mt-2">
                  {item.price ? `NPR ${Math.round(item.price / 100).toLocaleString()}` : "Contact for Price"}
                </div>
              </div>
            )
          })}
        </Grid>
      </Container>
    </Section>
  )
}
