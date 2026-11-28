import { SessionService } from "@/services/session.service"
import { OrderService } from "@/services/order.service"
import Link from "next/link"
import { ShoppingBag, ChevronRight, Search, Filter } from "lucide-react"

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

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case "DELIVERED":
      case "PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80"
      case "SHIPPED":
        return "bg-blue-50 text-blue-800 border-blue-200/80"
      case "PROCESSING":
        return "bg-amber-50 text-amber-800 border-amber-200/80"
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200/80"
      default:
        return "bg-[#FAF6F2] text-[#8C7A72] border-[#EDE3DB]"
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase">
            My Account
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B89563]" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A110F] font-normal">
          Order History
        </h1>
        <p className="text-xs text-[#8C7A72] mt-1">
          Track fulfillment status, review purchased items, and access order invoices.
        </p>
      </div>

      {/* ── Filter and Search Bar ── */}
      <form
        method="GET"
        className="bg-white rounded-2xl border border-[#EDE3DB] p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] grid grid-cols-1 sm:grid-cols-12 gap-3"
      >
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-[#8C7A72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            name="search"
            placeholder="Search by Order # or item..."
            defaultValue={search || ""}
            className="w-full h-11 pl-10 pr-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] placeholder:text-[#8C7A72] focus:outline-none focus:border-[#B89563] transition-colors"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            name="status"
            defaultValue={status || ""}
            className="w-full h-11 px-3 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full h-11 bg-[#1A110F] hover:bg-[#33221E] text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </form>

      {/* ── Orders List ── */}
      {ordersResult.items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#EDE3DB] p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#FAF6F2] border border-[#EDE3DB] flex items-center justify-center text-[#B89563] mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-[#1A110F]">No orders found</p>
          <p className="text-xs text-[#8C7A72] mt-1 max-w-sm">
            {search || status
              ? "Try adjusting your search criteria or filter to locate your order."
              : "You haven't placed any orders yet. Discover our latest arrivals."}
          </p>
          <Link
            href="/collections"
            className="mt-4 px-4 py-2 bg-[#1A110F] text-white text-xs rounded-xl font-medium hover:bg-[#33221E] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ordersResult.items.map((o) => {
            const firstItem = o.orderItems?.[0]
            const totalItemsCount = o.orderItems.reduce((acc, item) => acc + item.quantity, 0)
            const orderDate = new Date(o.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })

            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#B89563]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-serif text-sm sm:text-base font-semibold text-[#1A110F]">
                      {firstItem?.productName || o.orderNumber}
                      {o.orderItems.length > 1 && (
                        <span className="text-xs text-[#8C7A72] font-sans font-normal ml-1">
                          +{o.orderItems.length - 1} more
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                        o.status
                      )}`}
                    >
                      {o.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-[#8C7A72]">
                    Order <span className="font-mono text-[#1A110F] font-medium">{o.orderNumber}</span> · Placed on {orderDate} · {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2EFEA]">
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#8C7A72] block">
                      Total
                    </span>
                    <span className="font-semibold text-sm sm:text-base text-[#1A110F]">
                      NPR {Math.round(o.total / 100).toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${o.orderNumber}`}
                    className="px-4 py-2 rounded-xl bg-[#FAF6F2] hover:bg-[#1A110F] hover:text-white border border-[#EDE3DB] text-xs font-medium text-[#1A110F] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          {ordersResult.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: ordersResult.totalPages }).map((_, i) => {
                const p = i + 1
                const isActive = p === page
                return (
                  <Link
                    key={p}
                    href={`/account/orders?page=${p}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#1A110F] text-white shadow-xs"
                        : "bg-white border border-[#EDE3DB] text-[#73645D] hover:bg-[#FAF6F2]"
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
    </div>
  )
}
