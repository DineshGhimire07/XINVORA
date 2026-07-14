import { SessionService } from "@/services/session.service"
import { OrderService } from "@/services/order.service"
import { Stack } from "@/components/shared/stack"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export const metadata = {
  title: "Order History | XINVORA",
  description: "Track and review your previous orders.",
}

interface OrdersPageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await SessionService.requireAuth()
  const params = await searchParams
  
  const page = parseInt(params.page || "1")
  const search = params.search || undefined
  const status = params.status || undefined

  const ordersResult = await OrderService.getUserOrders(session.id, {
    page,
    limit: 10,
    search,
    status,
  })

  return (
    <Stack gap={6}>
      <div className="border-b border-border-primary/20 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">My Account</span>
          <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-1">Order History</h1>
        </div>
      </div>

      {/* Filter and Search Bar placeholder/links */}
      <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-border p-4 bg-surface-secondary/5">
        <input
          name="search"
          placeholder="Search by Order #..."
          defaultValue={search || ""}
          className="px-3 py-2 border border-input rounded-none text-body-sm focus:outline-none focus:ring-1 focus:ring-accent bg-surface"
        />
        <select
          name="status"
          defaultValue={status || ""}
          className="px-3 py-2 border border-input rounded-none text-body-sm focus:outline-none focus:ring-1 focus:ring-accent bg-surface h-10"
        >
          <option value="">All Statuses</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button
          type="submit"
          className="w-full bg-ink hover:bg-ink-soft text-white text-[11px] uppercase tracking-widest font-semibold rounded-none py-2"
        >
          Apply Filters
        </button>
      </form>

      {/* Orders List */}
      {ordersResult.items.length === 0 ? (
        <Card className="rounded-none border-dashed border-border-primary/60 text-center p-8 bg-surface-secondary/5">
          <p className="text-body-sm text-text-secondary">No orders matched your filters or query.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordersResult.items.map((o) => {
            const firstItem = o.orderItems?.[0]
            return (
              <Card key={o.id} className="rounded-none border-border-primary/40 shadow-xs hover:shadow-sm transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        {o.orderItems.length > 1 ? (
                          <span className="text-body-md font-semibold text-text-primary">
                            {firstItem?.productName || o.orderNumber}{" "}
                            <span className="text-admin-xs text-text-secondary font-normal font-sans tracking-normal">
                              +{o.orderItems.length - 1} more
                            </span>
                          </span>
                        ) : (
                          <span className="text-body-md font-semibold text-text-primary">
                            {firstItem?.productName || o.orderNumber}
                          </span>
                        )}
                        <span className="text-[9px] px-2 py-0.5 border border-border uppercase tracking-widest text-text-secondary bg-surface-secondary/30">
                          {o.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-caption text-text-secondary">
                        Placed on {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-caption text-text-secondary block">Total Amount</span>
                        <span className="text-body-md font-medium text-text-primary">{formatCurrency(o.total)}</span>
                      </div>
                      <Link
                        href={`/account/orders/${o.orderNumber}`}
                        className="px-4 py-2 border border-border text-[11px] uppercase tracking-wider font-medium hover:bg-surface-secondary/20 transition-all"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Simple Pagination */}
          {ordersResult.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-6">
              {Array.from({ length: ordersResult.totalPages }).map((_, i) => {
                const p = i + 1
                const isActive = p === page
                return (
                  <Link
                    key={p}
                    href={`/account/orders?page=${p}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
                    className={`w-8 h-8 flex items-center justify-center text-body-sm font-mono border rounded-none transition-all ${
                      isActive ? "bg-accent border-accent text-white" : "border-border text-text-secondary hover:text-text-primary hover:border-text-secondary"
                    }`}
                  >
                    {p}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Stack>
  )
}
