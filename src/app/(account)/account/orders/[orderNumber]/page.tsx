import { SessionService } from "@/services/session.service"
import { OrderService } from "@/services/order.service"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Package, MapPin, CreditCard, ChevronRight } from "lucide-react"

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await SessionService.requireAuth()
  const { orderNumber } = await params

  let order
  try {
    order = await OrderService.getOrderDetail(session.id, orderNumber)
  } catch (error) {
    redirect("/account/orders")
  }

  const timeline = OrderService.getTimelineSteps(order.status)
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const shippingAddr = (order.shippingAddress || {}) as any

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/account/orders"
              className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Orders</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A110F] font-normal">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-[#8C7A72] mt-1">
            Placed on {orderDate} · Status: <span className="font-semibold text-[#1A110F]">{order.status.replace("_", " ")}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1A110F] bg-[#FAF6F2] px-3.5 py-1.5 rounded-xl border border-[#EDE3DB]">
            Total: NPR {Math.round(order.total / 100).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Tracking Timeline ── */}
      <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="pb-4 border-b border-[#F2EFEA] mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B89563]">
            Fulfillment Progress
          </p>
        </div>

        {timeline.isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs text-center font-medium">
            This order has been cancelled.
          </div>
        ) : timeline.isFailed ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs text-center font-medium">
            Payment verification attempt failed. Please contact customer care.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {timeline.steps.map((step, idx) => {
              const isCompleted = idx <= timeline.currentIndex
              const isCurrent = idx === timeline.currentIndex

              return (
                <div
                  key={step.key}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-[#FAF6F2] border-[#B89563] shadow-xs"
                      : isCompleted
                      ? "bg-white border-[#EDE3DB]"
                      : "bg-[#FAF6F2]/40 border-[#EDE3DB]/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A72]">
                      Step 0{idx + 1}
                    </span>
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#1A110F]">
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Details Split Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Items (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 pb-4 border-b border-[#F2EFEA] mb-4">
              <Package className="w-4 h-4 text-[#B89563]" />
              <h2 className="text-xs font-bold tracking-[0.15em] text-[#1A110F] uppercase">
                Items in This Order ({order.items.length})
              </h2>
            </div>

            <div className="divide-y divide-[#F2EFEA]">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-medium text-[#1A110F] truncate">
                      {item.productName}
                    </h3>
                    {item.variantOptions && (
                      <p className="text-[11px] text-[#8C7A72] mt-0.5">
                        {[item.variantOptions.color, item.variantOptions.size].filter(Boolean).join(" / ") || "Standard"}
                      </p>
                    )}
                    <p className="text-[11px] text-[#8C7A72] mt-0.5 font-mono">
                      Qty: {item.quantity} · SKU: {item.sku}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#1A110F]">
                      NPR {Math.round((item.unitPrice * item.quantity) / 100).toLocaleString()}
                    </p>
                    {item.discountApplied > 0 && (
                      <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                        − NPR {Math.round(item.discountApplied / 100).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Bill & Shipping Details (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Bill Summary */}
          <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
            <h3 className="text-xs font-bold tracking-[0.15em] text-[#1A110F] uppercase pb-3 border-b border-[#F2EFEA]">
              Bill Breakdown
            </h3>

            <div className="space-y-2 text-xs text-[#73645D]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-[#1A110F]">NPR {Math.round(order.subtotal / 100).toLocaleString()}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-medium">− NPR {Math.round(order.discountAmount / 100).toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-medium text-[#1A110F]">NPR {Math.round(order.shippingCost / 100).toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-[#EDE3DB] text-sm font-semibold text-[#1A110F]">
                <span>Total Amount</span>
                <span className="font-bold">NPR {Math.round(order.total / 100).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#F2EFEA]">
              <MapPin className="w-3.5 h-3.5 text-[#B89563]" />
              <h3 className="text-xs font-bold tracking-[0.15em] text-[#1A110F] uppercase">
                Delivery Address
              </h3>
            </div>

            <div className="text-xs text-[#73645D] space-y-1 pt-1 leading-relaxed">
              <p className="font-semibold text-[#1A110F]">
                {shippingAddr.fullName || `${shippingAddr.firstName || ""} ${shippingAddr.lastName || ""}`.trim() || "Customer"}
              </p>
              {shippingAddr.phone && <p>{shippingAddr.phone}</p>}
              <p>
                {[shippingAddr.tole, shippingAddr.street, shippingAddr.landmark].filter(Boolean).join(", ") || shippingAddr.addressLine1 || shippingAddr.line1}
              </p>
              <p>
                {[shippingAddr.municipality || shippingAddr.city, shippingAddr.district, shippingAddr.province || shippingAddr.state].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
