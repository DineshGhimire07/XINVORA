import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Stack } from "@/components/shared/stack"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CancelledPageProps {
  searchParams: Promise<{ orderNumber?: string }>
}

export default async function CancelledPage({ searchParams }: CancelledPageProps) {
  const { orderNumber } = await searchParams

  return (
    <Section className="py-24 md:py-32 bg-background flex flex-col items-center justify-center min-h-screen text-center">
      <Container className="max-w-md">
        <Stack gap={6} className="items-center">
          <div className="w-16 h-16 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-secondary mb-2 font-light text-lg">
            ✕
          </div>
          
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-text-secondary uppercase">
              Cancelled
            </span>
            <h1 className="text-display-xs font-display text-text-primary uppercase tracking-wider mt-2">
              Payment Cancelled
            </h1>
          </div>

          <p className="text-body-sm text-text-secondary leading-relaxed">
            The checkout session was cancelled. Your order remains created as pending payment. You can complete the checkout process later.
          </p>

          <div className="pt-4 w-full flex flex-col gap-3">
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
