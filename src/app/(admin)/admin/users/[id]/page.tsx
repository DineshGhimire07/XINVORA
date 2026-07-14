import { SessionService } from "@/services/session.service"
import { ProfileService } from "@/services/profile.service"
import { db } from "@/db/client"
import { users } from "@/db/schema/users"
import { addresses } from "@/db/schema/addresses"
import { nepalProvinces } from "@/db/schema/nepal-provinces"
import { nepalDistricts } from "@/db/schema/nepal-districts"
import { nepalMunicipalities } from "@/db/schema/nepal-municipalities"
import { orders } from "@/db/schema/orders"
import { profiles } from "@/db/schema/profiles"
import { notFound } from "next/navigation"
import { eq, and, isNull, desc } from "drizzle-orm"
import { CustomerWorkspace } from "./CustomerWorkspace"

export const metadata = {
  title: "Customer Detail | XINVORA Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminCustomerDetailPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const { id } = await props.params

  // 1. Fetch user base details
  const [customer] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1)

  if (!customer) {
    notFound()
  }

  // 2. Resolve profile
  const profile = await ProfileService.getOrCreateProfile(id)

  // Query actual customerTier from profiles table
  const [profileDetails] = await db
    .select({ customerTier: profiles.customerTier })
    .from(profiles)
    .where(eq(profiles.userId, id))
    .limit(1)

  const customerTier = profileDetails?.customerTier || "BRONZE"

  // 3. Retrieve user addresses with joined administration names
  const userAddresses = await db
    .select({
      id: addresses.id,
      fullName: addresses.fullName,
      phone: addresses.phone,
      wardNumber: addresses.wardNumber,
      tole: addresses.tole,
      street: addresses.street,
      landmark: addresses.landmark,
      deliveryNote: addresses.deliveryNote,
      isDefault: addresses.isDefault,
      provinceName: nepalProvinces.name,
      districtName: nepalDistricts.name,
      municipalityName: nepalMunicipalities.name
    })
    .from(addresses)
    .leftJoin(nepalProvinces, eq(addresses.provinceId, nepalProvinces.id))
    .leftJoin(nepalDistricts, eq(addresses.districtId, nepalDistricts.id))
    .leftJoin(nepalMunicipalities, eq(addresses.municipalityId, nepalMunicipalities.id))
    .where(eq(addresses.userId, id))

  // 4. Retrieve user orders
  const userOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, id), isNull(orders.deletedAt)))
    .orderBy(desc(orders.createdAt))

  // 5. Compute dynamic metrics cleanly from real orders data
  const validOrdersForSpend = userOrders.filter(
    (o: any) => !["CANCELLED", "PENDING_PAYMENT"].includes(o.status)
  )
  const totalOrders = validOrdersForSpend.length
  const lifetimeSpend = validOrdersForSpend.reduce((sum: number, o: any) => sum + o.total, 0)
  const averageOrderValue = totalOrders > 0 ? Math.round(lifetimeSpend / totalOrders) : 0

  const computedMetrics = {
    totalOrders,
    lifetimeSpend,
    averageOrderValue,
    customerTier
  }

  return (
    <div className="space-y-6">
      <CustomerWorkspace
        customer={customer}
        profile={profile}
        addresses={userAddresses}
        orders={userOrders}
        metrics={computedMetrics}
      />
    </div>
  )
}
