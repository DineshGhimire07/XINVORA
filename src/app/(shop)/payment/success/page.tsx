import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Stack } from "@/components/shared/stack"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SuccessPageProps {
  searchParams: Promise<{ orderNumber?: string }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderNumber } = await searchParams

  return (
    <Section className="py-24 md:py-32 bg-background flex flex-col items-center justify-center min-h-screen text-center">
      <Container className="max-w-md">
        <Stack gap={6} className="items-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 mb-2">
            ✓
          </div>
          
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
              Thank You
            </span>
            <h1 className="text-display-xs font-display text-text-primary uppercase tracking-wider mt-2">
              Payment Successful
            </h1>
          </div>

          <p className="text-body-sm text-text-secondary leading-relaxed">
            Your payment has been securely processed. Your order is now confirmed and enters processing.
          </p>

          {orderNumber && (
            <div className="p-3 bg-surface-secondary/30 border border-border font-mono text-text-primary text-body-sm tracking-wide">
              Order No: {orderNumber}
            </div>
          )}

          <div className="pt-4 w-full">
            <Link href="/collections" className="block w-full">
              <Button size="lg" className="w-full uppercase tracking-wider text-xs rounded-none py-4">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}
