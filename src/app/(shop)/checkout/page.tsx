import { Suspense } from "react"
import { SessionService } from "@/services/session.service"
import { getCart } from "@/db/queries/cart"
import { getProvinces, getAllDistricts, getMunicipalitiesByDistrict } from "@/db/queries/nepal"
import { redirect } from "next/navigation"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { buildMetadata } from "@/lib/metadata"
import { db } from "@/db/client"
import { addresses } from "@/db/schema/addresses"
import { users } from "@/db/schema/users"
import { orders } from "@/db/schema/orders"
import { eq, desc } from "drizzle-orm"

import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow"

export const metadata = buildMetadata({
  title: "Checkout",
  description: "Complete your order with secure delivery to anywhere in Nepal.",
})

import { getPaymentQrsAction } from "@/actions/checkout.actions"

// ── Tier B: Non-blocking data loaded in a Suspense boundary ──────────────────
async function CheckoutFlowWithData({
  sessionId,
  totals,
}: {
  sessionId: string
  totals: any
}) {
  // Tier B fetches — provinces + all districts + saved address + user profile + latest order + payment QRs all in parallel
  const [provinces, allDistricts, savedAddress, userRecord, latestOrder, paymentQrsRes] = await Promise.all([
    getProvinces(),
    getAllDistricts(),
    db.query.addresses.findFirst({
      where: eq(addresses.userId, sessionId),
      orderBy: desc(addresses.createdAt),
      with: {
        province: true,
        district: true,
        municipality: true,
      },
    }),
    db.query.users.findFirst({
      where: eq(users.id, sessionId),
    }),
    db.query.orders.findFirst({
      where: eq(orders.userId, sessionId),
      orderBy: desc(orders.createdAt),
    }),
    getPaymentQrsAction(),
  ])

  const initialPaymentQrs = paymentQrsRes.success ? paymentQrsRes.data : null

  // 1. Synthesize historical address data from latest order or saved address
  const s = (latestOrder?.shippingAddress as any) || (savedAddress as any) || {}
  const userFullName = [userRecord?.firstName, userRecord?.lastName].filter(Boolean).join(" ")

  // 2. Resolve Province
  const resolvedProvince = provinces.find((p) => p.id === s.provinceId) ||
    provinces.find((p) => s.provinceName && p.name.toLowerCase().includes(String(s.provinceName).toLowerCase())) ||
    provinces.find((p) => p.name.includes("Bagmati")) ||
    provinces[0]

  // 3. Resolve District
  const provinceDistricts = allDistricts.filter((d) => d.provinceId === resolvedProvince?.id)
  const resolvedDistrict = allDistricts.find((d) => d.id === s.districtId) ||
    allDistricts.find((d) => s.districtName && d.name.toLowerCase() === String(s.districtName).toLowerCase()) ||
    provinceDistricts[0]

  // 4. Pre-fetch Municipalities for the resolved district
  let initialMunicipalities: any[] = []
  if (resolvedDistrict?.id) {
    initialMunicipalities = await getMunicipalitiesByDistrict(resolvedDistrict.id)
  }

  // 5. Pre-match Municipality
  const matchedMuni = initialMunicipalities.find((m) => m.id === s.municipalityId) ||
    initialMunicipalities.find((m) => s.municipalityName && m.name.toLowerCase() === String(s.municipalityName).toLowerCase()) ||
    initialMunicipalities[0]

  const effectiveAddress = {
    fullName: s.fullName || userFullName || "",
    phone: s.phone || "",
    provinceId: resolvedProvince?.id || "",
    provinceName: resolvedProvince?.name || "",
    districtId: resolvedDistrict?.id || "",
    districtName: resolvedDistrict?.name || "",
    municipalityId: matchedMuni?.id || s.municipalityId || "",
    municipalityName: matchedMuni?.name || s.municipalityName || "",
    wardNumber: s.wardNumber ? Number(s.wardNumber) : undefined,
    tole: s.tole || "",
    street: s.street || "",
    landmark: s.landmark || "",
    latitude: s.latitude || undefined,
    longitude: s.longitude || undefined,
    province: resolvedProvince ? { name: resolvedProvince.name } : null,
    district: resolvedDistrict ? { name: resolvedDistrict.name } : null,
    municipality: matchedMuni ? { name: matchedMuni.name, totalWards: matchedMuni.totalWards } : null,
  } as any

  return (
    <CheckoutFlow
      provinces={provinces}
      savedAddress={effectiveAddress}
      totals={totals}
      allDistricts={allDistricts}
      initialDistricts={provinceDistricts}
      initialMunicipalities={initialMunicipalities}
      initialPaymentQrs={initialPaymentQrs}
    />
  )
}

// ── Loading skeleton shown while Tier B data streams ─────────────────────────
function CheckoutSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      <div className="flex-1 bg-surface pt-32 pb-16 lg:pb-24 px-6 lg:px-12 xl:px-24">
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
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-surface-secondary/40 pt-8 pb-24 lg:pt-32 px-6 lg:px-12 xl:px-24 border-t lg:border-t-0 lg:border-l border-border/50">
        <div className="max-w-md mx-auto lg:mr-auto lg:ml-12 w-full animate-pulse">
          <div className="bg-[#FFFFFF] rounded-lg p-6 border border-[#E8DED2] space-y-4">
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
  if (!session) redirect("/login?callbackUrl=/checkout")

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
          totals={{
            cart: initialTotals.cart,
            subtotal: initialTotals.subtotal,
            discountAmount: initialTotals.discountAmount,
            shippingMethodId: initialTotals.shippingMethod.id,
            shippingCost: initialTotals.shippingCost,
            total: initialTotals.total,
          }}
        />
      </Suspense>
    </main>
  )
}
