import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Stack } from "@/components/shared/stack"
import { Button } from "@/components/ui/button"
import { findPayment } from "@/db/queries/payments"
import Link from "next/link"

interface FailedPageProps {
  searchParams: Promise<{ paymentId?: string }>
}

export default async function FailedPage({ searchParams }: FailedPageProps) {
  const { paymentId } = await searchParams
  let orderId: string | null = null

  if (paymentId) {
    const payment = await findPayment(paymentId)
    if (payment) {
      orderId = payment.orderId
    }
  }

  return (
    <Section className="py-24 md:py-32 bg-background flex flex-col items-center justify-center min-h-screen text-center">
      <Container className="max-w-md">
        <Stack gap={6} className="items-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-2 font-bold text-lg">
            !
          </div>
          
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-red-500 uppercase">
              Transaction Issue
            </span>
            <h1 className="text-display-xs font-display text-text-primary uppercase tracking-wider mt-2">
              Payment Failed
            </h1>
          </div>

          <p className="text-body-sm text-text-secondary leading-relaxed">
            We were unable to process your transaction. Your order remains pending. No funds were captured.
          </p>

          <Stack gap={3} className="pt-4 w-full">
            {orderId ? (
              <Link href={`/payment?orderId=${orderId}`} className="block w-full">
                <Button size="lg" className="w-full uppercase tracking-wider text-xs rounded-none py-4">
                  Retry Payment Attempt
                </Button>
              </Link>
            ) : (
              <Link href="/cart" className="block w-full">
                <Button size="lg" className="w-full uppercase tracking-wider text-xs rounded-none py-4">
                  Return to Cart
                </Button>
              </Link>
            )}
            
            <Link href="/shop" className="block w-full">
              <Button size="lg" variant="outline" className="w-full uppercase tracking-wider text-xs rounded-none py-4">
                Continue Shopping
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Section>
  )
}
