"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Printer, CheckCircle, Package, Truck, Clock, MapPin, Map, Navigation, CreditCard, Ban, RefreshCcw } from "lucide-react"
import { getOrderDetailsAction, updateOrderStatusAction, assignInvoiceNumberAction, deleteOrderAction } from "@/actions/admin/orders.actions"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"

export function OrderDetailsDrawer({ 
  orderId, 
  onClose 
}: { 
  orderId: string | null
  onClose: () => void 
}) {
  const [order, setOrder] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    if (orderId) {
      setLoading(true)
      getOrderDetailsAction(orderId).then((res) => {
        if (res.success) {
          setOrder(res.data)
        }
        setLoading(false)
      })
    } else {
      setOrder(null)
    }
  }, [orderId])

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return
    setIsUpdating(true)
    const res = await updateOrderStatusAction(order.id, newStatus)
    if (res.success) {
      // Re-fetch order details to get latest activity
      const updated = await getOrderDetailsAction(order.id)
      if (updated.success) setOrder(updated.data)
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`)
    } else {
      toast.error(res.error?.message || "Failed to update order status.")
    }
    setIsUpdating(false)
  }

  const handlePrint = async () => {
    if (!order) return
    if (!order.invoiceNumber) {
      setIsUpdating(true)
      const res = await assignInvoiceNumberAction(order.id)
      if (res.success) {
        order.invoiceNumber = res.data?.invoiceNumber
        setOrder({ ...order })
      }
      setIsUpdating(false)
    }
    // Open print window
    window.open(`/admin/orders/print/${order.id}`, "_blank", "width=800,height=600")
  }

  const handleDeleteOrder = async () => {
    if (!order) return
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete order "${order.orderNumber}"? This will restore stock levels and delete all payment history.`)
    if (!confirmDelete) return
    
    setIsDeleting(true)
    const res = await deleteOrderAction(order.id)
    if (res.success) {
      router.refresh()
      onClose()
    } else {
      alert(`Error: ${res.error?.message || "Failed to delete order"}`)
    }
    setIsDeleting(false)
  }

  return (
    <AnimatePresence>
      {orderId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-surface z-50 shadow-2xl flex flex-col border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-white">
              <div>
                <h2 className="text-lg font-display uppercase tracking-wider text-text-primary">
                  Order Details
                </h2>
                {order && (
                  <p className="text-xs text-text-secondary font-mono">
                    ID: {order.internalId} • {order.orderNumber}
                  </p>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeleteOrder}
                  disabled={isDeleting || isUpdating || loading}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4 mr-1.5" /> Delete
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrint}
                  disabled={isDeleting || isUpdating || loading}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
                <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-[#f9f9f9]">
              {loading || !order ? (
                <div className="h-full flex items-center justify-center text-sm text-text-secondary">
                  Loading order details...
                </div>
              ) : (
                <>
                  {/* Status & Actions */}
                  <div className="bg-white border border-border p-4 rounded-md shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs uppercase font-semibold text-text-secondary tracking-wider">
                        Delivery Status
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button 
                        size="sm" variant="outline" disabled={isUpdating}
                        onClick={() => handleUpdateStatus("CONFIRMED")}
                        className={order.status === "CONFIRMED" ? "bg-accent/10 border-accent text-accent" : ""}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirmed
                      </Button>
                      <Button 
                        size="sm" variant="outline" disabled={isUpdating}
                        onClick={() => handleUpdateStatus("PACKED")}
                        className={order.status === "PACKED" ? "bg-accent/10 border-accent text-accent" : ""}
                      >
                        <Package className="w-3.5 h-3.5 mr-1" /> Packed
                      </Button>
                      <Button 
                        size="sm" variant="outline" disabled={isUpdating}
                        onClick={() => handleUpdateStatus("SHIPPED")}
                        className={order.status === "SHIPPED" ? "bg-accent/10 border-accent text-accent" : ""}
                      >
                        <Truck className="w-3.5 h-3.5 mr-1" /> Shipped
                      </Button>
                      {order.status === "PAYMENT_PENDING_VERIFICATION" && (
                        <Button 
                          size="sm" variant="primary" disabled={isUpdating}
                          onClick={() => handleUpdateStatus("CONFIRMED")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verify Payment & Confirm
                        </Button>
                      )}
                      <Button 
                        size="sm" variant="outline" disabled={isUpdating}
                        onClick={() => handleUpdateStatus("OUT_FOR_DELIVERY")}
                        className={order.status === "OUT_FOR_DELIVERY" ? "bg-accent/10 border-accent text-accent" : ""}
                      >
                        <Navigation className="w-3.5 h-3.5 mr-1" /> Out for Delivery
                      </Button>
                      <Button 
                        size="sm" variant="outline" disabled={isUpdating}
                        onClick={() => handleUpdateStatus("DELIVERED")}
                        className="border-green-600 text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Delivered
                      </Button>
                      <Button 
                        size="sm" variant="outline" disabled={isUpdating}
                        onClick={() => handleUpdateStatus("CANCELLED")}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Customer & Payment Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Address */}
                    <div className="bg-white border border-border p-4 rounded-md shadow-sm">
                      <h3 className="text-xs uppercase font-semibold text-text-secondary tracking-wider mb-3 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Delivery Address
                      </h3>
                      <div className="text-sm text-text-primary space-y-1">
                        <p className="font-semibold">{order.shippingAddress?.fullName}</p>
                        <p>{order.shippingAddress?.phone}</p>
                        <div className="h-2" />
                        <p>{order.shippingAddress?.street} {order.shippingAddress?.landmark && `(Near ${order.shippingAddress?.landmark})`}</p>
                        <p>Tole: {order.shippingAddress?.tole}, Ward {order.shippingAddress?.wardNumber}</p>
                        <p>{order.shippingAddress?.municipality}, {order.shippingAddress?.district}</p>
                        <p>{order.shippingAddress?.province}, {order.shippingAddress?.country || "Nepal"}</p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white border border-border p-4 rounded-md shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs uppercase font-semibold text-text-secondary tracking-wider mb-3 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4" /> Payment Details
                        </h3>
                        <p className="text-sm font-medium">
                          {order.paymentProvider === "MANUAL" ? "Manual Transfer (Bank/COD)" :
                           order.paymentProvider === "ESEWA" ? "eSewa" :
                           order.paymentProvider === "KHALTI" ? "Khalti" :
                           order.paymentProvider === "CASH_ON_DELIVERY" ? "Cash On Delivery" :
                           order.paymentProvider || "Not Specified"}
                        </p>
                        <p className="text-xs text-text-secondary uppercase mt-1 tracking-wider">
                          Status: {order.paymentStatus}
                        </p>
                        
                        {order.paymentProofUrl && (
                          <div className="mt-3">
                            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Payment Proof</p>
                            <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="block w-full h-24 relative rounded border border-border overflow-hidden group bg-surface-secondary">
                              <Image src={order.paymentProofUrl} alt="Payment Proof" fill className="object-contain group-hover:scale-105 transition-transform" />
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary">Invoice:</span>
                          <span className="font-mono">{order.invoiceNumber || "Not Generated"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ordered Items */}
                  <div className="bg-white border border-border p-4 rounded-md shadow-sm">
                    <h3 className="text-xs uppercase font-semibold text-text-secondary tracking-wider mb-4 flex items-center gap-1.5">
                      <Package className="w-4 h-4" /> Ordered Products
                    </h3>
                    <div className="space-y-4">
                      {order.orderItems?.map((item: any) => (
                        <div key={item.id} className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-surface relative rounded overflow-hidden flex-shrink-0 border border-border">
                            {item.variant?.product?.productImages?.[0]?.url ? (
                              <Image 
                                src={item.variant.product.productImages[0].url}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-text-secondary uppercase">No Img</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{item.productName}</p>
                            <p className="text-xs text-text-secondary font-mono mt-0.5">SKU: {item.sku}</p>
                            <p className="text-xs text-text-secondary mt-1">
                              Size: {item.variant?.size?.name || "N/A"} • Color: {item.variant?.color?.name || "N/A"}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold">{formatCurrency(item.unitPrice)}</p>
                            <p className="text-xs text-text-secondary mt-1">x {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border space-y-2">
                      <div className="flex justify-between text-sm text-text-secondary">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-text-secondary">
                        <span>Discount</span>
                        <span>-{formatCurrency(order.discountAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-text-secondary">
                        <span>Delivery Charge</span>
                        <span>{formatCurrency(order.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold text-text-primary pt-2 border-t border-border/50">
                        <span>Grand Total</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="bg-white border border-border p-4 rounded-md shadow-sm">
                    <h3 className="text-xs uppercase font-semibold text-text-secondary tracking-wider mb-4 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Activity Timeline
                    </h3>
                    <div className="relative border-l border-border/60 ml-3 space-y-6 pb-2">
                      {order.orderActivity?.map((activity: any, idx: number) => (
                        <div key={activity.id} className="relative pl-6">
                          <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-accent border-2 border-white shadow-sm" />
                          <div className="text-sm font-medium text-text-primary flex items-center justify-between">
                            <span className="capitalize">
                              {activity.action === "STATUS_UPDATE" 
                                ? `Status updated to ${activity.newStatus.replace(/_/g, " ")}` 
                                : activity.action.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="text-xs text-text-secondary mt-1 flex justify-between">
                            <span>by {activity.admin?.firstName || "System"} {activity.admin?.lastName || ""}</span>
                            <span>
                              {new Date(activity.createdAt).toLocaleDateString("en-GB")} at {new Date(activity.createdAt).toLocaleTimeString("en-GB", {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Created Event (Always at bottom) */}
                      <div className="relative pl-6">
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-border border-2 border-white shadow-sm" />
                        <div className="text-sm font-medium text-text-primary">Order Created</div>
                        <div className="text-xs text-text-secondary mt-1 flex justify-between">
                          <span>by Customer</span>
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-GB")} at {new Date(order.createdAt).toLocaleTimeString("en-GB", {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function StatusBadge({ status }: { status: string }) {
  let colors = "bg-gray-100 text-gray-700 border-gray-200"
  switch(status) {
    case "PENDING":
    case "PENDING_PAYMENT": colors = "bg-yellow-50 text-yellow-700 border-yellow-200"; break;
    case "CONFIRMED":
    case "PROCESSING": colors = "bg-blue-50 text-blue-700 border-blue-200"; break;
    case "PACKED": colors = "bg-indigo-50 text-indigo-700 border-indigo-200"; break;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY": colors = "bg-purple-50 text-purple-700 border-purple-200"; break;
    case "DELIVERED": colors = "bg-green-50 text-green-700 border-green-200"; break;
    case "CANCELLED":
    case "REFUNDED": colors = "bg-red-50 text-red-700 border-red-200"; break;
  }
  return <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${colors}`}>{status.replace(/_/g, " ")}</span>
}
