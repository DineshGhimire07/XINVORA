import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Grid } from "@/components/shared/grid"
import { Button } from "@/components/ui/button"
import { CartItem } from "@/features/cart/components/CartItem"
import { CartSummary } from "@/features/cart/components/CartSummary"
import { getCart } from "@/db/queries/cart"
import { findProducts } from "@/db/queries/products"
import { SessionService } from "@/services/session.service"
import { CartService } from "@/services/cart.service"
import { ArrowRight } from "lucide-react"
import { ProductTrustGrid } from "@/components/storefront/ProductTrustGrid"
import { ProductCard } from "@/components/storefront/ProductCard"

export const metadata: Metadata = {
  title: "Shopping Cart | XINVORA",
  description: "View and manage your shopping cart.",
}

export default async function CartPage() {
  const { userId, sessionId } = await SessionService.getCommerceIdentity()
  const cart = await getCart(userId, sessionId)

  if (!cart || cart.items.length === 0) {
    return (
      <Section className="py-24 md:py-32 flex flex-col items-center justify-center text-center">
        <Container>
          <h1 className="text-display-md font-display mb-6">Your Cart is Empty</h1>
          <p className="text-body-lg text-text-secondary mb-12 max-w-md mx-auto">
            Discover our latest collections and find your new signature piece.
          </p>
          <Link href="/collections">
            <Button size="lg" className="px-12 uppercase tracking-wider">
              Continue Shopping
            </Button>
          </Link>
        </Container>
      </Section>
    )
  }

  const totals = await CartService.calculateTotals(cart)
  
  // Fetch recommended products
  const recommendationsResult = await findProducts({ limit: 5 })
  const recommendedProducts = recommendationsResult?.items || []

  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <Section className="pt-28 pb-12 md:pt-32 md:pb-24">
      <Container size="full" className="px-6 sm:px-12 md:px-16 lg:px-20">
        <div className="mb-12">
          <h1 className="text-display-md font-display uppercase tracking-wide">
            Shopping Cart
          </h1>
          <p className="text-overline tracking-widest text-text-secondary mt-1">
            {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
          </p>
        </div>

        <Grid cols={{ base: 1, lg: 12 }} gap={12}>
          <div className="lg:col-span-8 flex flex-col order-1">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-caption text-text-secondary uppercase tracking-widest font-semibold">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="flex flex-col">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Trust Badges */}
            <div className="mt-8">
              <ProductTrustGrid />
            </div>

          </div>

          <div className="lg:col-span-4 order-2 mt-4 lg:mt-0">
            <div className="sticky top-32">
              <CartSummary 
                subtotal={totals.subtotal}
                total={totals.subtotal}
                isEstimate={totals.isEstimate}
              />
            </div>
          </div>

          {/* Recommendations */}
          {recommendedProducts.length > 0 && (
            <div className="lg:col-span-8 order-3 lg:col-start-1">
              <div className="mt-16 lg:mt-12 border-t border-border/20 pt-10">
                <div className="flex justify-between items-baseline mb-8 select-none">
                  <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                    YOU MAY ALSO LOVE
                  </h2>
                  <Link href="/collections" className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase hover:text-text-primary transition-colors inline-flex items-center gap-1">
                    VIEW ALL <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                  {recommendedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      itemColors={[]}
                      itemSizes={[]}
                      hideWishlist={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

        </Grid>
      </Container>
    </Section>
  )
}
