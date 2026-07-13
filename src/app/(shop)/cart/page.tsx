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
              <div className="mt-16 lg:mt-8">
                <div className="flex justify-between items-baseline mb-8">
                  <h2 className="text-body-md font-bold uppercase tracking-wider text-text-primary">
                    You May Also Like
                  </h2>
                  <Link href="/collections" className="text-caption font-semibold tracking-wider uppercase hover:underline inline-flex items-center gap-1">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {recommendedProducts.map((product) => {
                    const mainImage = product.productImages?.[0]?.url
                    return (
                      <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col text-left">
                        <div className="aspect-[3/4] relative bg-surface-secondary overflow-hidden mb-3 border border-border rounded-sm">
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={product.name}
                              fill
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-text-secondary bg-surface-secondary">
                              No Image
                            </div>
                          )}
                        </div>
                        <h3 className="text-body-xs font-medium text-text-primary group-hover:underline truncate mt-1">
                          {product.name}
                        </h3>
                        <p className="text-body-xs text-text-secondary mt-0.5 font-semibold">
                          {product.lowestPrice !== null 
                            ? `NPR ${Math.round(product.lowestPrice / 100).toLocaleString()}`
                            : "Contact for Price"
                          }
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

        </Grid>
      </Container>
    </Section>
  )
}
