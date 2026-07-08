import { Metadata } from "next"
import Link from "next/link"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Grid } from "@/components/shared/grid"
import { Button } from "@/components/ui/button"
import { CartItem } from "@/features/cart/components/CartItem"
import { CartSummary } from "@/features/cart/components/CartSummary"
import { getCart } from "@/db/queries/cart"
import { SessionService } from "@/services/session.service"
import { CartService } from "@/services/cart.service"

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

  return (
    <Section className="pt-28 pb-12 md:pt-32 md:pb-24">
      <Container>
        <h1 className="text-display-sm font-display mb-12 uppercase tracking-wide">
          Shopping Cart
        </h1>

        <Grid cols={{ base: 1, lg: 12 }} gap={12}>
          <div className="lg:col-span-8">
            <div className="hidden md:grid grid-cols-6 gap-4 pb-4 border-b border-border text-body-sm text-text-secondary uppercase tracking-wider">
              <div className="col-span-1">Item</div>
              <div className="col-span-2"></div>
              <div className="col-span-1 text-center">Price</div>
              <div className="col-span-1 text-center">Quantity</div>
              <div className="col-span-1 text-right">Total</div>
            </div>

            <div className="flex flex-col">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <CartSummary 
                subtotal={totals.subtotal}
                total={totals.subtotal}
                isEstimate={totals.isEstimate}
              />
            </div>
          </div>
        </Grid>
      </Container>
    </Section>
  )
}
