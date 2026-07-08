import { SessionService } from "@/services/session.service"
import { getCart } from "@/db/queries/cart"
import { getProvinces } from "@/db/queries/nepal"
import { redirect } from "next/navigation"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { OrderSummary } from "@/features/checkout/components/OrderSummary"
import { NepalDeliveryForm } from "@/features/checkout/components/NepalDeliveryForm"
import { buildMetadata } from "@/lib/metadata"
import { db } from "@/db/client"
import { addresses } from "@/db/schema/addresses"
import { eq, desc } from "drizzle-orm"

import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow"

export const metadata = buildMetadata({
  title: "Checkout",
  description: "Complete your order with secure delivery to anywhere in Nepal.",
})

export default async function CheckoutPage() {
  const session = await SessionService.optionalAuth()
  if (!session) redirect("/auth/login?callbackUrl=/checkout")

  const cart = await getCart(session.id, null)
  if (!cart || cart.items.length === 0) redirect("/cart")

  const { AdminSettingsService } = await import("@/services/admin/settings.service")
  const maintenance = await AdminSettingsService.getSetting("maintenance")
  if (maintenance?.mode === "store_closed") {
    return (
      <Container className="py-24 max-w-2xl text-center space-y-6">
        <h1 className="text-3xl font-light tracking-tight">Checkout is Currently Closed</h1>
        <p className="text-text-secondary">
          {maintenance.message || "We are currently not accepting new orders. Please check back later."}
        </p>
      </Container>
    )
  }

  // Calculate totals to pass into the flow
  const { CheckoutService } = await import("@/services/checkout.service")
  // Since we don't have the final shipping method selected yet, we'll calculate base cart totals first
  // Actually, we DO need a default shipping method id to run `calculateTotals`. Let's mock it for the initial state.
  const initialTotals = await CheckoutService.calculateTotals(session.id, {
    shippingMethodId: "standard", // default
  } as any).catch(() => null)

  if (!initialTotals) {
    redirect("/cart")
  }

  // Load provinces server-side for SSR
  const provinces = await getProvinces()

  // Load most recent saved address for pre-fill
  const [savedAddress] = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.id))
    .orderBy(desc(addresses.createdAt))
    .limit(1)

  const paymentQrs = await AdminSettingsService.getSetting("payment_qrs")

  return (
    <Section padding="lg" className="min-h-screen bg-surface-secondary/40">
      <Container size="lg">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-2">
            XINVORA
          </p>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">Checkout</h1>
        </div>

        <CheckoutFlow 
          provinces={provinces}
          savedAddress={savedAddress || null}
          totals={initialTotals}
          paymentQrs={paymentQrs}
        />
      </Container>
    </Section>
  )
}
