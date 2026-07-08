import { redirect } from "next/navigation"
import { findOrderById } from "@/db/queries/orders"
import { SessionService } from "@/services/session.service"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PaymentMethodSelector } from "./PaymentMethodSelector"

export const metadata = {
  title: "Complete Your Payment | XINVORA",
  description: "Select your payment method and finalize your luxury order.",
}

interface PaymentPageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const session = await SessionService.optionalAuth()
  if (!session) {
    redirect("/login?callbackUrl=/payment")
  }

  const { orderId } = await searchParams
  if (!orderId) {
    redirect("/cart")
  }

  const order = await findOrderById(orderId)
  if (!order) {
    redirect("/cart")
  }

  // Ensure this order belongs to the logged-in user
  if (order.userId !== session.id) {
    redirect("/cart")
  }

  // If order is already paid, redirect to success page
  if (order.status !== "PENDING_PAYMENT") {
    redirect(`/payment/success?orderNumber=${order.orderNumber}`)
  }

  // Generate a CSRF nonce for the payment flow
  const csrfNonce = await SessionService.setCsrfNonce()

  return (
    <Section className="py-12 md:py-24 bg-background min-h-screen">
      <Container>
        <Stack gap={10}>
          <div className="text-left">
            <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
              Secure Checkout
            </span>
            <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-2">
              Payment Gateway
            </h1>
          </div>
 
          <Grid cols={{ base: 1, lg: 12 }} gap={8} className="items-start">
            {/* Left: Payment Method Selection */}
            <div className="lg:col-span-7">
              <PaymentMethodSelector orderId={order.id} orderNumber={order.orderNumber} csrfNonce={csrfNonce} />
            </div>

            {/* Right: Order Summary Snapshot */}
            <div className="lg:col-span-5">
              <Card className="rounded-none border-border-primary/40 shadow-sm sticky top-32">
                <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50">
                  <CardTitle className="text-md font-light tracking-wide uppercase">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Stack gap={4}>
                    <div className="flex justify-between text-body-sm text-text-secondary">
                      <span>Order Reference</span>
                      <span className="font-mono text-text-primary">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-body-sm text-text-secondary">
                      <span>Subtotal</span>
                      <span>NPR {Math.round(order.subtotal / 100).toLocaleString()}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-body-sm text-accent">
                        <span>Discount</span>
                        <span>-NPR {Math.round(order.discountAmount / 100).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-body-sm text-text-secondary">
                      <span>Shipping ({order.shippingMethod || "Standard"})</span>
                      <span>NPR {Math.round(order.shippingCost / 100).toLocaleString()}</span>
                    </div>
                    <hr className="border-border/60 my-2" />
                    <div className="flex justify-between text-body-md font-medium text-text-primary">
                      <span>Total Amount</span>
                      <span>NPR {Math.round(order.total / 100).toLocaleString()}</span>
                    </div>
                  </Stack>
                </CardContent>
              </Card>
            </div>
          </Grid>
        </Stack>
      </Container>
    </Section>
  )
}
