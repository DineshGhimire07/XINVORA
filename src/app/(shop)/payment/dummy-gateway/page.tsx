import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Stack } from "@/components/shared/stack"
import Link from "next/link"

interface DummyGatewayPageProps {
  searchParams: Promise<{ paymentId?: string; amount?: string; callbackUrl?: string; provider?: string }>
}

export default async function DummyGatewayPage({ searchParams }: DummyGatewayPageProps) {
  const { paymentId, amount, callbackUrl, provider } = await searchParams

  if (!paymentId || !amount || !callbackUrl) {
    return (
      <Section className="py-24 bg-background">
        <Container className="max-w-md text-center">
          <h1 className="text-display-xs font-display text-red-600 uppercase">Invalid Simulator Request</h1>
          <p className="text-body-md text-text-secondary mt-4">Required query parameters are missing.</p>
          <Link href="/cart" className="mt-8 inline-block text-body-sm underline uppercase">Go back to cart</Link>
        </Container>
      </Section>
    )
  }

  const formattedAmount = Math.round(parseInt(amount) / 100).toLocaleString()

  // Redirect targets that include simulation state
  const successUrl = `${callbackUrl}?paymentId=${paymentId}&status=success`
  const failureUrl = `${callbackUrl}?paymentId=${paymentId}&status=failed`
  const cancelUrl = `${callbackUrl}?paymentId=${paymentId}&status=cancelled`

  const providerLower = (provider as string || "").toUpperCase()
  
  let brandName = "Dummy Payment Gateway"
  let bgTheme = "bg-accent/5"
  let borderTheme = "border-accent/20"
  let textTheme = "text-accent"
  let badgeLabel = "Sandbox Simulator"
  
  if (providerLower === "ESEWA") {
    brandName = "eSewa E-Payment Portal"
    bgTheme = "bg-green-50"
    borderTheme = "border-green-200"
    textTheme = "text-green-600"
    badgeLabel = "eSewa Sandbox"
  } else if (providerLower === "KHALTI") {
    brandName = "Khalti Merchant Checkout"
    bgTheme = "bg-purple-50"
    borderTheme = "border-purple-200"
    textTheme = "text-purple-600"
    badgeLabel = "Khalti Sandbox"
  } else if (providerLower === "STRIPE") {
    brandName = "Stripe Secure Card Checkout"
    bgTheme = "bg-indigo-50"
    borderTheme = "border-indigo-200"
    textTheme = "text-indigo-600"
    badgeLabel = "Stripe Sandbox"
  } else if (providerLower === "PAYPAL") {
    brandName = "PayPal Express Checkout"
    bgTheme = "bg-amber-50"
    borderTheme = "border-amber-200"
    textTheme = "text-amber-600"
    badgeLabel = "PayPal Sandbox"
  }

  return (
    <Section className="py-12 md:py-24 bg-surface-secondary/30 min-h-screen flex items-center justify-center">
      <Container className="max-w-lg">
        <Card className="rounded-none border-border-primary/80 shadow-lg bg-surface">
          <CardHeader className={`border-b border-border-primary/20 ${bgTheme} py-8 text-center`}>
            <span className={`text-[9px] font-bold tracking-[0.25em] ${textTheme} uppercase bg-surface px-3 py-1 border ${borderTheme} rounded-full`}>
              {badgeLabel}
            </span>
            <CardTitle className="text-xl font-display text-text-primary uppercase tracking-wider mt-4">
              {brandName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <Stack gap={4} className="p-4 bg-surface-secondary/20 border border-border">
              <div className="flex justify-between text-body-sm text-text-secondary">
                <span>Transaction Reference</span>
                <span className="font-mono text-text-primary text-[11px]">{paymentId}</span>
              </div>
              <div className="flex justify-between text-body-sm text-text-secondary">
                <span>Simulator Merchant</span>
                <span className="text-text-primary font-medium">XINVORA Storefront</span>
              </div>
              <div className="flex justify-between text-body-sm text-text-secondary">
                <span>Amount to Pay</span>
                <span className="text-text-primary font-bold text-body-md">NPR {formattedAmount}</span>
              </div>
            </Stack>

            <p className="text-body-sm text-text-secondary text-center max-w-sm mx-auto leading-relaxed">
              This page simulates a third-party checkout gateway. Choose a simulation scenario below to finalize your payment transaction callback.
            </p>

            <Stack gap={3} className="pt-4">
              <a
                href={successUrl}
                className="w-full text-center py-3 bg-green-600 hover:bg-green-700 text-white font-semibold uppercase tracking-widest text-xs transition-colors"
              >
                Simulate Successful Payment
              </a>
              <a
                href={failureUrl}
                className="w-full text-center py-3 bg-red-600 hover:bg-red-700 text-white font-semibold uppercase tracking-widest text-xs transition-colors"
              >
                Simulate Failed Payment
              </a>
              <a
                href={cancelUrl}
                className="w-full text-center py-3 border border-border hover:bg-surface-secondary/50 text-text-primary font-semibold uppercase tracking-widest text-xs transition-colors"
              >
                Cancel / Decline Transaction
              </a>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Section>
  )
}
