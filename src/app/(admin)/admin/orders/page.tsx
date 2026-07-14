import { SessionService } from "@/services/session.service"
import { findAdminOrdersPaginated } from "@/db/queries/orders"
import { OrdersClient } from "./OrdersClient"

export const metadata = {
  title: "Orders | XINVORA Admin",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }>
}

const tabToStatuses: Record<string, string[]> = {
  pending: ["PENDING", "PENDING_PAYMENT", "PAYMENT_PENDING_VERIFICATION"],
  processing: ["CONFIRMED", "PAID", "PROCESSING", "PACKED"],
  shipped: ["SHIPPED", "OUT_FOR_DELIVERY"],
  delivered: ["DELIVERED"],
  cancelled: ["CANCELLED", "REFUNDED", "FAILED"],
}

export default async function AdminOrdersPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const limit = 20
  const search = searchParams.search || ""
  const tabId = searchParams.status || "all"
  const sortBy = searchParams.sortBy === "total" ? "total" : "createdAt"
  const sortOrder = searchParams.sortOrder === "asc" ? "asc" : "desc"

  // Fetch status categories if configured
  const statusFilter = tabId !== "all" ? tabToStatuses[tabId] : undefined

  const ordersData = await findAdminOrdersPaginated({
    page,
    limit,
    search,
    status: statusFilter,
    sortBy,
    sortOrder,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          Orders
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Manage, track, and process customer transactions.
        </p>
      </div>

      <OrdersClient
        ordersData={ordersData}
        currentStatusTab={tabId}
        currentSearch={search}
      />
    </div>
  )
}
