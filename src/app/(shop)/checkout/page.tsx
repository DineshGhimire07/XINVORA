import { Suspense } from "react"
import { SessionService } from "@/services/session.service"
import { getCart } from "@/db/queries/cart"
import { getProvinces, getDistrictsByProvince, getMunicipalitiesByDistrict } from "@/db/queries/nepal"
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
  // Tier B fetches — provinces + saved address in parallel (no paymentQrs — deferred to step 2)
  const [provinces, savedAddress] = await Promise.all([
    getProvinces(),
    db.query.addresses.findFirst({
      where: eq(addresses.userId, sessionId),
      orderBy: desc(addresses.createdAt),
      with: {
        province: true,
        district: true,
        municipality: true,
      },
    }),
  ])

  // Part 2: Pre-fetch districts/municipalities for saved address so the cascade
  // renders immediately without a client-side fetch waterfall
  let initialDistricts: any[] = []
  let initialMunicipalities: any[] = []

  if (savedAddress?.provinceId && savedAddress?.districtId) {
    // Both are independent once we have the IDs — run in parallel
    ;[initialDistricts, initialMunicipalities] = await Promise.all([
      getDistrictsByProvince(savedAddress.provinceId),
      getMunicipalitiesByDistrict(savedAddress.districtId),
    ])
  } else if (savedAddress?.provinceId) {
    initialDistricts = await getDistrictsByProvince(savedAddress.provinceId)
  }

  return (
    <CheckoutFlow
      provinces={provinces}
      savedAddress={savedAddress}
      totals={totals}
      initialDistricts={initialDistricts}
      initialMunicipalities={initialMunicipalities}
    />
  )
}

// ── Loading skeleton shown while Tier B data streams ─────────────────────────
function CheckoutSkeleton() {
  return (
    <div className="flex flex-col-reverse lg:flex-row min-h-screen w-full">
      <div className="flex-1 bg-surface pt-32 pb-24 px-6 lg:px-12 xl:px-24">
        <div className="max-w-2xl mx-auto lg:ml-auto lg:mr-16 w-full animate-pulse space-y-10">
          <div className="space-y-2">
            <div className="h-4 bg-surface-secondary rounded w-24" />
            <div className="h-8 bg-surface-secondary rounded w-48" />
          </div>
          <div className="bg-surface rounded-lg border border-border space-y-6 p-6">
            <div className="h-6 bg-surface-secondary rounded w-48" />
            <div className="space-y-4">
              <div className="h-12 bg-surface-secondary rounded" />
              <div className="h-12 bg-surface-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-surface-secondary/40 pt-32 pb-24 px-6 lg:px-12 xl:px-24 lg:border-l border-border/50">
        <div className="max-w-md mx-auto lg:mr-auto lg:ml-12 w-full animate-pulse">
          <div className="bg-surface rounded-lg p-6 border border-border space-y-4">
            <div className="h-5 bg-surface-secondary rounded w-32" />
            <div className="space-y-3">
              <div className="h-16 bg-surface-secondary rounded" />
              <div className="h-16 bg-surface-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page (Tier A: blocking) ─────────────────────────────────────────────
export default async function CheckoutPage() {
  const session = await SessionService.optionalAuth()
  if (!session) redirect("/auth/login?callbackUrl=/checkout")

  // Parallelize getCart + maintenance check — both only need session.id, not each other
  const { AdminSettingsService } = await import("@/services/admin/settings.service")
  const [cart, maintenance] = await Promise.all([
    getCart(session.id, null),
    AdminSettingsService.getSetting("maintenance"),
  ])

  if (!cart || cart.items.length === 0) redirect("/cart")

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

  // Tier A: Calculate totals (blocking — pass preloaded cart to avoid redundant getCart fetch)
  const { CheckoutService } = await import("@/services/checkout.service")
  const initialTotals = await CheckoutService.calculateTotals(session.id, {
    shippingMethodId: "standard",
  } as any, cart).catch(() => null)

  if (!initialTotals) {
    redirect("/cart")
  }

  return (
    <main className="min-h-screen bg-surface">
      {/* Tier B data (provinces, saved address + its geo cascade) streams in via Suspense */}
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutFlowWithData
          sessionId={session.id}
          totals={initialTotals}
        />
      </Suspense>
    </main>
  )
}
