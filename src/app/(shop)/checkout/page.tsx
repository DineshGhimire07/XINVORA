import { Suspense } from "react"
import { SessionService } from "@/services/session.service"
import { getCart } from "@/db/queries/cart"
import { getProvinces } from "@/db/queries/nepal"
import { redirect } from "next/navigation"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { buildMetadata } from "@/lib/metadata"
import { db } from "@/db/client"
import { addresses } from "@/db/schema/addresses"
import { eq, desc } from "drizzle-orm"

import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow"

export const metadata = buildMetadata({
  title: "Checkout",
  description: "Complete your order with secure delivery to anywhere in Nepal.",
})

// ── Tier B: Non-blocking data loaded in a Suspense boundary ──────────────────
async function CheckoutFlowWithData({
  sessionId,
  totals,
}: {
  sessionId: string
  totals: any
}) {
  // Tier B fetches — run in parallel, streamed via Suspense
  const { AdminSettingsService } = await import("@/services/admin/settings.service")

  const [provinces, savedAddresses, paymentQrs] = await Promise.all([
    getProvinces(),
    db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, sessionId))
      .orderBy(desc(addresses.createdAt))
      .limit(1),
    AdminSettingsService.getSetting("payment_qrs"),
  ])

  return (
    <CheckoutFlow
      provinces={provinces}
      savedAddress={savedAddresses[0] || null}
      totals={totals}
      paymentQrs={paymentQrs}
    />
  )
}

// ── Loading skeleton shown while Tier B data streams ─────────────────────────
function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
      <div className="lg:col-span-8">
        <div className="bg-surface rounded-2xl p-6 lg:p-8 shadow-sm border border-border space-y-6">
          <div className="h-6 bg-surface-secondary rounded w-48" />
          <div className="space-y-4">
            <div className="h-12 bg-surface-secondary rounded" />
            <div className="h-12 bg-surface-secondary rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-surface-secondary rounded" />
              <div className="h-12 bg-surface-secondary rounded" />
            </div>
            <div className="h-12 bg-surface-secondary rounded" />
            <div className="h-12 bg-surface-secondary rounded" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 hidden lg:block">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border space-y-4">
          <div className="h-5 bg-surface-secondary rounded w-32" />
          <div className="space-y-3">
            <div className="h-16 bg-surface-secondary rounded" />
            <div className="h-16 bg-surface-secondary rounded" />
          </div>
          <div className="h-px bg-border" />
          <div className="h-5 bg-surface-secondary rounded w-24 ml-auto" />
        </div>
      </div>
    </div>
  )
}

// ── Main Page (Tier A: blocking) ─────────────────────────────────────────────
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

  // Tier A: Calculate totals (blocking — needed before rendering the flow)
  const { CheckoutService } = await import("@/services/checkout.service")
  const initialTotals = await CheckoutService.calculateTotals(session.id, {
    shippingMethodId: "standard",
  } as any).catch(() => null)

  if (!initialTotals) {
    redirect("/cart")
  }

  return (
    <Section padding="lg" className="min-h-screen bg-surface-secondary/40">
      <Container size="lg">
        {/* Header — renders immediately */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-2">
            XINVORA
          </p>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">Checkout</h1>
        </div>

        {/* Tier B data (provinces, saved address, payment QRs) streams in via Suspense */}
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutFlowWithData
            sessionId={session.id}
            totals={initialTotals}
          />
        </Suspense>
      </Container>
    </Section>
  )
}
