import { SessionService } from "@/services/session.service"
import { OrderService } from "@/services/order.service"
import { redirect } from "next/navigation"
import { Stack } from "@/components/shared/stack"
import { Grid } from "@/components/shared/grid"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"

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

  return (
    <Stack gap={8}>
      {/* Header */}
      <div className="border-b border-border-primary/20 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">My Account / Order Detail</span>
          <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-1 font-mono">
            {order.orderNumber}
          </h1>
        </div>
        <Link href="/account/orders" className="text-[11px] uppercase tracking-wider underline hover:text-accent font-medium">
          ← Back to List
        </Link>
      </div>

      {/* Timeline Tracker */}
      <Card className="rounded-none border-border-primary/40 shadow-sm">
        <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
          <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Tracking Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {timeline.isCancelled ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-body-sm text-center">
              This order has been cancelled.
            </div>
          ) : timeline.isFailed ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-body-sm text-center">
              Payment attempt failed. Please try again.
            </div>
          ) : (
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
              {/* Progress bar line (Desktop) */}
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border/60 -translate-y-1/2 hidden md:block z-0" />
              
              {timeline.steps.map((step, idx) => {
                const isCompleted = idx <= timeline.currentIndex
                const isActive = idx === timeline.currentIndex
                return (
                  <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 z-10 bg-background md:px-2 relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                        isCompleted
                          ? "bg-accent border-accent text-white font-bold"
                          : "bg-surface border-border text-text-secondary"
                      } ${isActive ? "ring-4 ring-accent/15" : ""}`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-body-xs tracking-wider uppercase font-medium ${
                        isCompleted ? "text-text-primary" : "text-text-secondary"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Split */}
      <Grid cols={{ base: 1, lg: 12 }} gap={8}>
        {/* Left: Items list */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-none border-border-primary/40 shadow-sm">
            <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
              <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 divide-y divide-border/40">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 first:pt-0 flex justify-between gap-4">
                  <div>
                    <h3 className="text-body-sm font-medium text-text-primary">{item.productName}</h3>
                    <p className="text-caption text-text-secondary font-mono mt-1">SKU: {item.sku}</p>
                    {item.variantOptions && (
                      <p className="text-caption text-text-secondary mt-0.5">
                        {item.variantOptions.color && `Color: ${item.variantOptions.color}`}
                        {item.variantOptions.size && ` | Size: ${item.variantOptions.size}`}
                      </p>
                    )}
                    <p className="text-body-xs text-text-secondary mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-sm font-medium">${((item.unitPrice * item.quantity) / 100).toFixed(2)}</p>
                    {item.discountApplied > 0 && (
                      <p className="text-caption text-accent mt-0.5">-${(item.discountApplied / 100).toFixed(2)} discount</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary details */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-none border-border-primary/40 shadow-sm">
            <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
              <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Stack gap={3}>
                <div className="flex justify-between text-body-xs text-text-secondary">
                  <span>Subtotal</span>
                  <span>${(order.subtotal / 100).toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-body-xs text-accent">
                    <span>Discount</span>
                    <span>-${(order.discountAmount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-body-xs text-text-secondary">
                  <span>Shipping</span>
                  <span>${(order.shippingCost / 100).toFixed(2)}</span>
                </div>
                <hr className="border-border/40 my-1" />
                <div className="flex justify-between text-body-sm font-semibold text-text-primary">
                  <span>Total</span>
                  <span>${(order.total / 100).toFixed(2)} {order.currency}</span>
                </div>
              </Stack>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border-primary/40 shadow-sm">
            <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
              <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-body-sm text-text-secondary space-y-1">
              <p className="text-text-primary font-medium">
                {(order.shippingAddress as any).firstName} {(order.shippingAddress as any).lastName}
              </p>
              <p>{(order.shippingAddress as any).addressLine1}</p>
              {(order.shippingAddress as any).addressLine2 && <p>{(order.shippingAddress as any).addressLine2}</p>}
              <p>{(order.shippingAddress as any).city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).postalCode}</p>
              <p>{(order.shippingAddress as any).country}</p>
            </CardContent>
          </Card>
        </div>
      </Grid>
    </Stack>
  )
}
