"use client"

import { useState, startTransition } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { updateOrderStatusAction } from "@/actions/admin/orders.actions"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Tag, 
  ShoppingBag, 
  HelpCircle, 
  ChevronRight,
  FileText,
  History,
  MessageSquare,
  AlertTriangle,
  Smartphone,
  Monitor
} from "lucide-react"

interface OrderDetailClientProps {
  order: any
  totalOrders: number
  sessionInfo?: {
    ipAddress: string
    deviceType: string
    browser: string
    operatingSystem: string
    utmSource: string | null
  } | null
}

type TabType = "details" | "timeline" | "notes" | "activity"

export function OrderDetailWorkspace({ order, totalOrders, sessionInfo }: OrderDetailClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("details")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // Dynamic VALID_TRANSITIONS mapping in client component
  const VALID_TRANSITIONS: Record<string, string[]> = {
    "PENDING": ["CONFIRMED", "CANCELLED"],
    "PENDING_PAYMENT": ["CONFIRMED", "CANCELLED"],
    "PAYMENT_PENDING_VERIFICATION": ["CONFIRMED", "CANCELLED"],
    "CONFIRMED": ["PROCESSING", "PACKED", "SHIPPED", "CANCELLED"],
    "PROCESSING": ["PACKED", "SHIPPED", "CANCELLED"],
    "PACKED": ["SHIPPED", "OUT_FOR_DELIVERY", "CANCELLED"],
    "SHIPPED": ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
    "OUT_FOR_DELIVERY": ["DELIVERED", "RETURNED", "CANCELLED"],
    "DELIVERED": ["RETURN_REQUESTED"],
    "RETURN_REQUESTED": ["RETURNED", "DELIVERED"],
    "RETURNED": ["PENDING", "CONFIRMED"],
    "CANCELLED": ["PENDING", "CONFIRMED"]
  }

  // Get allowed next statuses including current
  const allowedNextStatuses = Array.from(new Set([
    order.status,
    ...(VALID_TRANSITIONS[order.status] || [])
  ]))

  // Address parsing with fallback keys for both formats
  const addr = order.shippingAddress || {}
  const fullName = addr.fullName || "N/A"
  const phone = addr.phone || "N/A"
  
  // Format detailed Nepalese address or fallback
  const getDetailedAddress = () => {
    if (!order.shippingAddress) return "N/A"
    
    // Nepal administrative hierarchy
    const street = addr.street || addr.addressLine1 || ""
    const tole = addr.tole || ""
    const landmark = addr.landmark || addr.addressLine2 || ""
    const ward = addr.wardNumber ? `Ward No. ${addr.wardNumber}` : ""
    const municipality = addr.municipalityName || addr.municipality || addr.city || ""
    const district = addr.districtName || addr.district || addr.state || ""
    const province = addr.provinceName || addr.province || addr.postalCode || ""
    const country = addr.country || "Nepal"

    const lines = [
      street,
      [tole, landmark ? `(${landmark})` : null].filter(Boolean).join(" "),
      [municipality, ward].filter(Boolean).join(", "),
      [district, province].filter(Boolean).join(", "),
      country
    ].filter(Boolean)

    return lines.map((line, idx) => (
      <p key={idx} className="text-admin-sm text-admin-text-primary leading-normal">{line}</p>
    ))
  }

  // Activity log timestamps mapping
  const findActivityTime = (statusName: string) => {
    const act = order.orderActivity?.find((a: any) => a.newStatus === statusName)
    if (act) {
      return new Date(act.createdAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    }
    return null
  }

  // Stepper milestones helper
  const isMilestoneReached = (milestone: string) => {
    const current = order.status
    const hierarchy = ["PENDING", "PENDING_PAYMENT", "PAYMENT_PENDING_VERIFICATION", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]
    
    if (milestone === "PLACED") return true
    if (milestone === "PAID") return order.paymentStatus === "PAID"
    if (milestone === "PROCESSING") {
      return ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(current)
    }
    if (milestone === "SHIPPED") {
      return ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(current)
    }
    if (milestone === "DELIVERED") {
      return current === "DELIVERED"
    }
    return false
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    setUpdateError(null)
    try {
      const res = await updateOrderStatusAction(order.id, newStatus)
      if (res.success) {
        startTransition(() => {
          router.refresh()
        })
      } else {
        setUpdateError(res.error?.message || "Failed to update order status")
      }
    } catch (err: any) {
      setUpdateError(err.message || "An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  const isTransitionAllowed = (target: string) => {
    return (VALID_TRANSITIONS[order.status] || []).includes(target)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center pb-2 border-b border-admin-border/50">
        <div>
          <h1 className="text-admin-xl font-bold font-display text-admin-text-primary tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-admin-xs text-admin-text-secondary mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating}
            className="px-3.5 py-1.5 bg-admin-surface border border-admin-border text-admin-text-primary text-admin-xs font-semibold rounded-admin-md focus:outline-none focus:border-admin-border-strong cursor-pointer transition-colors"
          >
            {allowedNextStatuses.map((status) => (
              <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
            ))}
          </select>
          <a
            href={`/admin/orders/print/${order.id}`}
            target="_blank"
            className="bg-admin-content text-admin-text-primary border border-admin-border px-4 py-1.5 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-admin-content-hover transition-colors"
          >
            Print Invoice
          </a>
        </div>
      </div>

      {updateError && (
        <div className="p-4 bg-admin-status-danger-bg/25 border border-admin-status-danger-text/30 text-admin-status-danger-text text-admin-sm rounded-admin-md font-medium">
          {updateError}
        </div>
      )}

      {/* 1. TOP STEPPER PROGRESS BAR */}
      <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 shadow-xs">
        <div className="grid grid-cols-5 gap-2 relative">
          {/* Milestone 1: Placed */}
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 bg-admin-surface",
              isMilestoneReached("PLACED") 
                ? "border-admin-status-success-text text-admin-status-success-text"
                : "border-admin-border text-admin-text-secondary"
            )}>
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-admin-xs font-bold text-admin-text-primary mt-2">Order Placed</span>
            <span className="text-[10px] text-admin-text-secondary mt-0.5">
              {new Date(order.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Milestone 2: Payment Confirmed */}
          <div className="flex flex-col items-center text-center">
            <button
              disabled={isUpdating || !isTransitionAllowed("CONFIRMED")}
              onClick={() => handleStatusChange("CONFIRMED")}
              title={isTransitionAllowed("CONFIRMED") ? "Click to confirm payment and order" : undefined}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 bg-admin-surface focus:outline-none transition-all",
                isMilestoneReached("PAID")
                  ? "border-admin-status-success-text text-admin-status-success-text"
                  : "border-admin-border text-admin-text-secondary",
                isTransitionAllowed("CONFIRMED") && !isUpdating
                  ? "cursor-pointer hover:border-admin-primary hover:text-admin-primary scale-105 active:scale-95"
                  : "cursor-default"
              )}
            >
              {isMilestoneReached("PAID") ? <CheckCircle className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
            </button>
            <span className="text-admin-xs font-bold text-admin-text-primary mt-2">Payment Confirmed</span>
            <span className="text-[10px] text-admin-text-secondary mt-0.5">
              {findActivityTime("PAID") || findActivityTime("CONFIRMED") || "—"}
            </span>
          </div>

          {/* Milestone 3: Processing */}
          <div className="flex flex-col items-center text-center">
            <button
              disabled={isUpdating || !isTransitionAllowed("PROCESSING")}
              onClick={() => handleStatusChange("PROCESSING")}
              title={isTransitionAllowed("PROCESSING") ? "Click to start processing" : undefined}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 bg-admin-surface focus:outline-none transition-all",
                isMilestoneReached("PROCESSING")
                  ? "border-admin-primary text-admin-primary"
                  : "border-admin-border text-admin-text-secondary",
                isTransitionAllowed("PROCESSING") && !isUpdating
                  ? "cursor-pointer hover:border-admin-primary hover:text-admin-primary scale-105 active:scale-95"
                  : "cursor-default"
              )}
            >
              {isMilestoneReached("PROCESSING") ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </button>
            <span className="text-admin-xs font-bold text-admin-text-primary mt-2">Processing</span>
            <span className="text-[10px] text-admin-text-secondary mt-0.5">
              {findActivityTime("PROCESSING") || findActivityTime("CONFIRMED") || "—"}
            </span>
          </div>

          {/* Milestone 4: Shipped */}
          <div className="flex flex-col items-center text-center">
            <button
              disabled={isUpdating || !isTransitionAllowed("SHIPPED")}
              onClick={() => handleStatusChange("SHIPPED")}
              title={isTransitionAllowed("SHIPPED") ? "Click to ship order" : undefined}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 bg-admin-surface focus:outline-none transition-all",
                isMilestoneReached("SHIPPED")
                  ? "border-admin-status-success-text text-admin-status-success-text"
                  : "border-admin-border text-admin-text-secondary",
                isTransitionAllowed("SHIPPED") && !isUpdating
                  ? "cursor-pointer hover:border-admin-primary hover:text-admin-primary scale-105 active:scale-95"
                  : "cursor-default"
              )}
            >
              {isMilestoneReached("SHIPPED") ? <CheckCircle className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
            </button>
            <span className="text-admin-xs font-bold text-admin-text-primary mt-2">Shipped</span>
            <span className="text-[10px] text-admin-text-secondary mt-0.5">
              {findActivityTime("SHIPPED") || "—"}
            </span>
          </div>

          {/* Milestone 5: Delivered */}
          <div className="flex flex-col items-center text-center">
            <button
              disabled={isUpdating || !isTransitionAllowed("DELIVERED")}
              onClick={() => handleStatusChange("DELIVERED")}
              title={isTransitionAllowed("DELIVERED") ? "Click to mark as delivered" : undefined}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 bg-admin-surface focus:outline-none transition-all",
                isMilestoneReached("DELIVERED")
                  ? "border-admin-status-success-text text-admin-status-success-text"
                  : "border-admin-border text-admin-text-secondary",
                isTransitionAllowed("DELIVERED") && !isUpdating
                  ? "cursor-pointer hover:border-admin-primary hover:text-admin-primary scale-105 active:scale-95"
                  : "cursor-default"
              )}
            >
              {isMilestoneReached("DELIVERED") ? <CheckCircle className="h-4 w-4" /> : <Package className="h-4 w-4" />}
            </button>
            <span className="text-admin-xs font-bold text-admin-text-primary mt-2">Delivered</span>
            <span className="text-[10px] text-admin-text-secondary mt-0.5">
              {findActivityTime("DELIVERED") || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TWO COLUMN WORKSTATION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Core Order Details, Items, and Stepper Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Subtabs selection */}
          <div className="flex border-b border-admin-border">
            <button
              onClick={() => setActiveTab("details")}
              className={cn(
                "px-5 py-2.5 font-semibold text-admin-xs transition-colors border-b-2 -mb-px",
                activeTab === "details"
                  ? "border-admin-primary text-admin-text-primary"
                  : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
              )}
            >
              Order Details
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={cn(
                "px-5 py-2.5 font-semibold text-admin-xs transition-colors border-b-2 -mb-px",
                activeTab === "timeline"
                  ? "border-admin-primary text-admin-text-primary"
                  : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
              )}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={cn(
                "px-5 py-2.5 font-semibold text-admin-xs transition-colors border-b-2 -mb-px",
                activeTab === "notes"
                  ? "border-admin-primary text-admin-text-primary"
                  : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
              )}
            >
              Notes ({order.notes ? 1 : 0})
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={cn(
                "px-5 py-2.5 font-semibold text-admin-xs transition-colors border-b-2 -mb-px",
                activeTab === "activity"
                  ? "border-admin-primary text-admin-text-primary"
                  : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
              )}
            >
              Activity Log
            </button>
          </div>

          {/* TAB CONTENTS MAP */}
          {activeTab === "details" && (
            <div className="space-y-6">
              
              {/* Customer Info Card */}
              <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-admin-text-secondary" />
                    <h3 className="font-bold text-admin-sm text-admin-text-primary">Customer</h3>
                  </div>
                  <a
                    href={`/admin/users/${order.userId}`}
                    className="text-admin-xs border border-admin-border px-3 py-1 text-admin-text-primary hover:bg-admin-content rounded-admin-sm font-semibold transition-colors"
                  >
                    View Customer
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-admin-sm text-admin-text-primary">{order.customerName || `${order.user?.firstName} ${order.user?.lastName}`}</p>
                    <p className="text-admin-xs text-admin-text-secondary font-mono">{order.customerEmail || order.user?.email}</p>
                    <p className="text-admin-xs text-admin-text-secondary">{phone}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-admin-xs border-l border-admin-border pl-4">
                    <div>
                      <p className="text-admin-text-secondary">Total Orders</p>
                      <p className="font-bold text-admin-text-primary mt-1 text-admin-sm">{totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-admin-text-secondary">Customer Since</p>
                      <p className="font-bold text-admin-text-primary mt-1 text-admin-sm">
                        {order.user?.createdAt 
                          ? new Date(order.user.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                          : "N/A"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address Card */}
              <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-admin-text-secondary" />
                    <h3 className="font-bold text-admin-sm text-admin-text-primary">Shipping Address</h3>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-admin-sm bg-admin-status-success-bg text-admin-status-success-text ml-1.5">
                      Residential
                    </span>
                  </div>
                  <button
                    disabled
                    className="text-admin-xs border border-admin-border px-3 py-1 text-admin-text-primary/50 cursor-not-allowed rounded-admin-sm font-semibold"
                  >
                    Edit Address
                  </button>
                </div>
                
                <div className="space-y-1">
                  <p className="font-semibold text-admin-sm text-admin-text-primary">{fullName}</p>
                  <div className="space-y-0.5">{getDetailedAddress()}</div>
                  <p className="text-admin-xs text-admin-text-secondary mt-1">{phone}</p>
                </div>
              </div>

              {/* Order Items card */}
              <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-admin-border pb-3">
                  <ShoppingBag className="h-4.5 w-4.5 text-admin-text-secondary" />
                  <h3 className="font-bold text-admin-sm text-admin-text-primary">Order Items</h3>
                </div>

                <div className="divide-y divide-admin-border">
                  {order.orderItems?.map((item: any) => {
                    const imgUrl = item.variant?.product?.productImages?.[0]?.url
                    return (
                      <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 max-w-[65%]">
                          <div className="h-12 w-12 rounded-admin-md border border-admin-border bg-admin-content/25 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {imgUrl ? (
                              <img src={imgUrl} alt={item.productName} className="h-full w-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-admin-text-secondary" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-admin-sm text-admin-text-primary leading-snug">{item.productName}</p>
                            <p className="text-admin-xs text-admin-text-secondary">
                              {[
                                item.variant?.size?.name ? `Size: ${item.variant.size.name}` : null,
                                item.variant?.color?.name ? `Color: ${item.variant.color.name}` : null
                              ].filter(Boolean).join(" • ")}
                            </p>
                            <p className="text-admin-xs text-admin-text-secondary font-mono mt-0.5">SKU: {item.sku}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <div className="text-admin-sm text-admin-text-secondary font-medium">
                            {formatCurrency(item.unitPrice)}
                          </div>
                          <div className="text-admin-sm text-admin-text-secondary">
                            × {item.quantity}
                          </div>
                          <div className="text-admin-sm font-bold text-admin-text-primary">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-admin-border">
                  <button
                    disabled
                    className="inline-flex items-center justify-center text-admin-xs font-bold border border-admin-border border-dashed px-4 py-2 text-admin-text-primary/50 cursor-not-allowed rounded-admin-md bg-admin-content/10 transition-colors w-full"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Payment Information Card */}
              <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
                <div className="flex items-center gap-2 justify-between border-b border-admin-border pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4.5 w-4.5 text-admin-text-secondary" />
                    <h3 className="font-bold text-admin-sm text-admin-text-primary">Payment Information</h3>
                  </div>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-admin-sm",
                    order.paymentStatus === "PAID"
                      ? "bg-admin-status-success-bg text-admin-status-success-text"
                      : "bg-admin-status-warning-bg text-admin-status-warning-text"
                  )}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-admin-sm">
                  <div>
                    <p className="text-admin-text-secondary text-admin-xs">Payment Method</p>
                    <p className="font-semibold text-admin-text-primary mt-1">{order.paymentMethod || "COD"}</p>
                  </div>
                  <div>
                    <p className="text-admin-text-secondary text-admin-xs">Transaction ID</p>
                    <p className="font-mono text-admin-text-primary mt-1 break-all">{order.paymentIntentId || "—"}</p>
                  </div>
                  <div>
                    <p className="text-admin-text-secondary text-admin-xs">Paid On</p>
                    <p className="font-semibold text-admin-text-primary mt-1">
                      {order.paymentStatus === "PAID" 
                        ? (findActivityTime("PAID") || new Date(order.updatedAt).toLocaleString()) 
                        : "—"
                      }
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === "timeline" && (
            <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-6">
              <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-admin-text-secondary" />
                Order Progress History
              </h3>
              
              <div className="relative pl-6 border-l-2 border-admin-border ml-3 py-2 space-y-6">
                {order.orderActivity?.map((act: any) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-admin-border bg-admin-surface" />
                    <div className="text-admin-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-admin-text-primary">
                          {act.action.replace(/_/g, " ")}
                        </p>
                        <span className="text-admin-xs text-admin-text-secondary">
                          {new Date(act.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      {act.newStatus && (
                        <p className="text-admin-xs text-admin-text-secondary leading-normal">
                          Status transition: <span className="font-semibold text-admin-text-primary">{act.oldStatus || "N/A"}</span> →{" "}
                          <span className="font-semibold text-admin-text-primary">{act.newStatus}</span>
                        </p>
                      )}
                      {act.admin?.firstName && (
                        <p className="text-admin-xs text-admin-text-secondary">
                          Staff actor: <span className="font-semibold text-admin-text-primary">{act.admin.firstName} {act.admin.lastName}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
              <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-admin-text-secondary" />
                Order Notes
              </h3>
              
              {order.notes ? (
                <div className="bg-admin-status-warning-bg/10 border border-admin-status-warning-text/25 p-4 rounded-admin-md space-y-1">
                  <h4 className="text-admin-xs font-bold text-admin-status-warning-text uppercase tracking-wider">Customer Checkout Note</h4>
                  <p className="text-admin-sm text-admin-text-primary italic leading-relaxed">"{order.notes}"</p>
                </div>
              ) : (
                <div className="py-12 text-center text-admin-sm text-admin-text-secondary bg-admin-content/10 border border-admin-border border-dashed rounded-admin-md">
                  No notes or instructions attached to this order.
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-6">
              <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-admin-text-secondary" />
                Staff Activity Log
              </h3>
              
              <div className="relative pl-6 border-l-2 border-admin-border ml-3 py-2 space-y-6">
                {order.orderActivity?.map((act: any) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-admin-border bg-admin-surface" />
                    <div className="text-admin-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-admin-text-primary">
                          {act.action.replace(/_/g, " ")}
                        </p>
                        <span className="text-admin-xs text-admin-text-secondary">
                          {new Date(act.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      {act.admin?.firstName && (
                        <p className="text-admin-xs text-admin-text-secondary mt-1">
                          Action performed by: <span className="font-semibold text-admin-text-primary">{act.admin.firstName} {act.admin.lastName}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Summary and Panel Sidebars */}
        <div className="space-y-6">
          
          {/* 1. Order Summary Panel */}
          <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-admin-text-secondary" />
              Order Summary
            </h3>
            
            <div className="space-y-2.5 text-admin-sm">
              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Subtotal ({order.orderItems?.length || 0} items)</span>
                <span className="font-semibold text-admin-text-primary">{formatCurrency(order.subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Discount</span>
                <span className="font-semibold text-admin-status-success-text">
                  {order.discountAmount > 0 ? `- ${formatCurrency(order.discountAmount)}` : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Shipping</span>
                <span className="font-semibold text-admin-text-primary">{formatCurrency(order.shippingCost)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Tax (13%)</span>
                <span className="font-semibold text-admin-text-primary">{formatCurrency(order.taxAmount)}</span>
              </div>

              <div className="h-px bg-admin-border my-2" />
              
              <div className="flex justify-between items-center text-admin-base font-bold text-admin-text-primary">
                <span>Total</span>
                <span className="text-admin-lg font-bold">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Payment captured box callout */}
            <div className="bg-admin-status-warning-bg/15 border border-admin-status-warning-text/25 p-4 rounded-admin-md space-y-3">
              <div className="flex gap-2 text-admin-status-warning-text">
                <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-admin-xs font-bold">Payment captured</p>
                  <p className="text-[10px] opacity-90 mt-0.5">
                    This order was paid using {order.paymentMethod || "COD"}.
                  </p>
                </div>
              </div>
              <button
                disabled
                className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 bg-admin-surface text-admin-text-primary border border-admin-border rounded-admin-sm hover:bg-admin-content-hover cursor-not-allowed transition-all"
              >
                View Payment
              </button>
            </div>
          </div>

          {/* 2. Order Tags Card */}
          <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-admin-border pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4.5 w-4.5 text-admin-text-secondary" />
                <h3 className="font-bold text-admin-sm text-admin-text-primary">Order Tags</h3>
              </div>
              <button
                disabled
                className="text-admin-xs text-admin-text-secondary/50 font-semibold cursor-not-allowed"
              >
                Edit
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {totalOrders === 1 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-admin-primary/10 text-admin-primary rounded-full">
                  New Customer
                </span>
              )}
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-admin-status-success-bg text-admin-status-success-text rounded-full">
                {order.paymentStatus}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-admin-content border border-admin-border text-admin-text-secondary rounded-full">
                Online Store
              </span>
              {order.discountAmount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-admin-status-warning-bg text-admin-status-warning-text rounded-full">
                  Promotion
                </span>
              )}
            </div>
          </div>

          {/* 3. Fulfillment Card */}
          <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-admin-border pb-3">
              <h3 className="font-bold text-admin-sm text-admin-text-primary">Fulfillment</h3>
              <button
                disabled
                className="text-admin-xs border border-admin-border px-3 py-1 text-admin-text-primary/50 cursor-not-allowed rounded-admin-sm font-semibold"
              >
                Create Shipment
              </button>
            </div>

            <div className="space-y-3.5 text-admin-sm">
              <div className="flex justify-between items-center">
                <span className="text-admin-text-secondary">Fulfillment Status</span>
                <span className={cn(
                  "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-admin-sm",
                  ["SHIPPED", "DELIVERED"].includes(order.status)
                    ? "bg-admin-status-success-bg text-admin-status-success-text"
                    : "bg-admin-status-warning-bg text-admin-status-warning-text"
                )}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Warehouse</span>
                <span className="font-semibold text-admin-text-primary">Kathmandu Main Warehouse</span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Tracking Number</span>
                <span className="font-mono text-admin-text-secondary">—</span>
              </div>
            </div>
          </div>

          {/* 4. Additional Information Card */}
          <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-admin-border pb-3">
              <h3 className="font-bold text-admin-sm text-admin-text-primary">Additional Information</h3>
              <button
                disabled
                className="text-admin-xs text-admin-text-secondary/50 cursor-not-allowed"
              >
                Edit
              </button>
            </div>

            <div className="space-y-3 text-admin-sm">
              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Source</span>
                <span className="font-semibold text-admin-text-primary">
                  {sessionInfo?.utmSource || "Online Store"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-admin-text-secondary">Device</span>
                <span className="font-semibold text-admin-text-primary inline-flex items-center gap-1.5 capitalize">
                  {sessionInfo?.deviceType?.toLowerCase() === "mobile" ? (
                    <Smartphone className="h-3.5 w-3.5 text-admin-text-secondary" />
                  ) : (
                    <Monitor className="h-3.5 w-3.5 text-admin-text-secondary" />
                  )}
                  {sessionInfo?.deviceType?.toLowerCase() || "desktop"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-text-secondary">IP Address</span>
                <span className="font-mono text-admin-text-secondary">
                  {sessionInfo?.ipAddress || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Notes</span>
                <span className="text-admin-text-secondary">
                  {order.notes || "—"}
                </span>
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  )
}
