import { AdminOrdersService } from "@/services/admin/orders.service"
import { Stack } from "@/components/shared/stack"
import { OrdersTable } from "./OrdersTable"
import { formatCurrency } from "@/lib/utils"

export const metadata = {
  title: "Orders | XINVORA Admin",
}

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 20
  const searchQuery = searchParams.searchQuery || ""
  const status = searchParams.status || "all"
  const dateRange = searchParams.dateRange || "all"
  const paymentMethod = searchParams.paymentMethod || "all"
  const sort = searchParams.sort || "newest"

  const [metrics, ordersData] = await Promise.all([
    AdminOrdersService.getDashboardMetrics(),
    AdminOrdersService.getOrders({
      page,
      limit,
      searchQuery,
      status,
      dateRange,
      paymentMethod,
      sort,
    }),
  ])

  return (
    <Stack gap={8}>
      <div>
        <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide">
          Orders
        </h1>
        <p className="text-body-sm text-text-secondary mt-2">
          Manage, track, and process customer orders.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard label="Today's Orders" value={metrics.today_orders || 0} />
        <MetricCard label="Today's Revenue" value={formatCurrency(Number(metrics.today_revenue) || 0)} />
        <MetricCard label="Pending" value={metrics.pending_orders || 0} />
        <MetricCard label="Confirmed" value={metrics.confirmed_orders || 0} />
        <MetricCard label="Packed" value={metrics.packed_orders || 0} />
        <MetricCard label="Shipped" value={metrics.shipped_orders || 0} />
        <MetricCard label="Out For Delivery" value={metrics.out_for_delivery || 0} />
        <MetricCard label="Delivered" value={metrics.delivered_orders || 0} />
        <MetricCard label="Cancelled" value={metrics.cancelled_orders || 0} />
        <MetricCard label="COD Orders" value={metrics.cod_orders || 0} />
        <MetricCard label="Online Paid" value={metrics.online_orders || 0} />
        <MetricCard label="Avg Order Value" value={formatCurrency(Number(metrics.average_order_value) || 0)} />
      </div>

      <div className="mt-4">
        <OrdersTable 
          initialData={ordersData} 
          searchParams={{ page, limit, searchQuery, status, dateRange, paymentMethod, sort }} 
        />
      </div>
    </Stack>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-border p-4 rounded-md shadow-sm flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">
        {label}
      </span>
      <span className="text-xl font-mono text-text-primary">
        {value}
      </span>
    </div>
  )
}
