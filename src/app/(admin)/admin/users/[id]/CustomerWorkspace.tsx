"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { cn } from "@/lib/utils"
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  MessageSquare, 
  History,
  Mail,
  Phone,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react"

interface CustomerWorkspaceProps {
  customer: any
  profile: any
  addresses: any[]
  orders: any[]
  metrics: {
    totalOrders: number
    lifetimeSpend: number
    averageOrderValue: number
    customerTier: string
  }
}

type TabType = "overview" | "orders" | "addresses" | "notes" | "activity"

export function CustomerWorkspace({ 
  customer, 
  profile, 
  addresses, 
  orders, 
  metrics 
}: CustomerWorkspaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer?")) return
    
    setIsDeleting(true)
    const { deleteCustomerAction } = await import("@/actions/admin/customers.actions")
    const res = await deleteCustomerAction(customer.id)
    setIsDeleting(false)
    
    if (res.success) {
      router.push("/admin/users")
      router.refresh()
    } else {
      alert(res.error?.message || "Failed to delete customer")
    }
  }

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Unnamed Customer"
  const initials = [customer.firstName?.[0], customer.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "C"

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex justify-between items-center pb-2 border-b border-admin-border/50">
        <div>
          <h1 className="text-admin-xl font-bold font-display text-admin-text-primary tracking-tight">
            {fullName}
          </h1>
          <p className="text-admin-xs text-admin-text-secondary mt-0.5">
            Customer joined on {new Date(customer.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete Customer"}
          </button>
          <button
            onClick={() => router.push("/admin/users")}
            className="bg-admin-content text-admin-text-primary border border-admin-border px-4 py-1.5 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-admin-content-hover transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Grid Layout: Main Workspace + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sub-tabs list */}
          <div className="flex border-b border-admin-border">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-5 py-2.5 font-semibold text-admin-xs transition-colors border-b-2 -mb-px",
                activeTab === "overview"
                  ? "border-admin-primary text-admin-text-primary"
                  : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={cn(
                "px-5 py-2.5 font-semibold text-admin-xs transition-colors border-b-2 -mb-px",
                activeTab === "orders"
                  ? "border-admin-primary text-admin-text-primary"
                  : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
              )}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={cn(
                "px-5 py-2.5 font-semibold text-admin-xs transition-colors border-b-2 -mb-px",
                activeTab === "addresses"
                  ? "border-admin-primary text-admin-text-primary"
                  : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
              )}
            >
              Addresses ({addresses.length})
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
              Notes (0)
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
              Activity
            </button>
          </div>

          {/* Tab Panel contents */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Dynamic stats cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-4 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider block">
                    Lifetime Spend
                  </span>
                  <span className="text-admin-lg font-bold text-admin-text-primary mt-1.5 block">
                    {formatCurrency(metrics.lifetimeSpend)}
                  </span>
                </div>
                <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-4 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider block">
                    Total Orders
                  </span>
                  <span className="text-admin-lg font-bold text-admin-text-primary mt-1.5 block">
                    {metrics.totalOrders}
                  </span>
                </div>
                <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-4 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider block">
                    Avg Order Value
                  </span>
                  <span className="text-admin-lg font-bold text-admin-text-primary mt-1.5 block">
                    {formatCurrency(metrics.averageOrderValue)}
                  </span>
                </div>
              </div>

              {/* Personal details card */}
              <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
                <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-admin-text-secondary" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-admin-sm">
                  <div>
                    <span className="text-admin-text-secondary text-admin-xs block">Email Address</span>
                    <span className="font-medium text-admin-text-primary mt-0.5 block">{customer.email}</span>
                  </div>
                  <div>
                    <span className="text-admin-text-secondary text-admin-xs block">Phone Number</span>
                    <span className="font-medium text-admin-text-primary mt-0.5 block">{profile.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-admin-text-secondary text-admin-xs block">Date of Birth</span>
                    <span className="font-medium text-admin-text-primary mt-0.5 block">
                      {profile.dateOfBirth 
                        ? new Date(profile.dateOfBirth).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                        : "—"
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-admin-text-secondary text-admin-xs block">Newsletter Subscription</span>
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1",
                      profile.newsletterPreference
                        ? "bg-admin-status-success-bg text-admin-status-success-text"
                        : "bg-admin-content border border-admin-border text-admin-text-secondary"
                    )}>
                      {profile.newsletterPreference ? "Subscribed" : "Unsubscribed"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
              <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-admin-text-secondary" />
                Purchase History
              </h3>

              {orders.length > 0 ? (
                <div className="border border-admin-border rounded-admin-md overflow-hidden bg-admin-content/10 divide-y divide-admin-border">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="p-3.5 flex justify-between items-center text-admin-sm bg-admin-surface hover:bg-admin-content/20 cursor-pointer transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-admin-text-primary inline-flex items-center gap-1.5">
                          {order.orderNumber} <ChevronRight className="h-3.5 w-3.5 text-admin-text-secondary" />
                        </span>
                        <p className="text-admin-xs text-admin-text-secondary">
                          Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-6 text-right">
                        <StatusBadge status={order.status} />
                        <div>
                          <p className="font-bold text-admin-text-primary">{formatCurrency(order.total)}</p>
                          <p className="text-[10px] text-admin-text-secondary font-mono mt-0.5 uppercase">
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-admin-sm text-admin-text-secondary bg-admin-content/10 border border-admin-border border-dashed rounded-admin-md">
                  No orders have been placed by this customer yet.
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
              <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-admin-text-secondary" />
                Delivery Addresses
              </h3>

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => {
                    const lines = [
                      address.street,
                      [address.tole, address.landmark ? `(${address.landmark})` : null].filter(Boolean).join(" "),
                      [address.municipalityName, address.wardNumber ? `Ward No. ${address.wardNumber}` : null].filter(Boolean).join(", "),
                      [address.districtName, address.provinceName].filter(Boolean).join(", "),
                      "Nepal"
                    ].filter(Boolean)

                    return (
                      <div key={address.id} className="border border-admin-border p-4 rounded-admin-md bg-admin-content/5 relative space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-admin-sm text-admin-text-primary">{address.fullName}</span>
                          {address.isDefault && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-admin-primary/10 text-admin-primary rounded-admin-sm">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-admin-xs text-admin-text-secondary space-y-0.5 leading-relaxed">
                          {lines.map((line, idx) => <p key={idx}>{line}</p>)}
                        </div>
                        <div className="text-[10px] text-admin-text-secondary font-mono border-t border-admin-border/50 pt-1.5 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-admin-text-secondary" /> {address.phone}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-admin-sm text-admin-text-secondary bg-admin-content/10 border border-admin-border border-dashed rounded-admin-md">
                  No saved delivery addresses found for this customer.
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
              <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-admin-text-secondary" />
                Customer Notes
              </h3>

              <div className="py-12 text-center text-admin-sm text-admin-text-secondary bg-admin-content/10 border border-admin-border border-dashed rounded-admin-md">
                No custom administrative notes captured for this customer.
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-4">
              <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-admin-text-secondary" />
                Customer Event Activity
              </h3>

              <div className="py-12 text-center text-admin-sm text-admin-text-secondary bg-admin-content/10 border border-admin-border border-dashed rounded-admin-md">
                No recent timeline events found for this customer.
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Summary and Metadata Sidebar */}
        <div className="space-y-6">
          
          {/* Customer profile sidebar block */}
          <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 text-center space-y-4 shadow-xs">
            <div className="h-16 w-16 bg-admin-primary/10 border border-admin-primary/20 text-admin-primary rounded-full flex items-center justify-center font-bold text-admin-xl mx-auto shadow-inner select-none">
              {initials}
            </div>
            
            <div className="space-y-0.5">
              <h3 className="font-bold text-admin-base text-admin-text-primary">{fullName}</h3>
              <p className="text-admin-xs text-admin-text-secondary font-mono">{customer.email}</p>
            </div>
            
            <div className="border-t border-admin-border/50 pt-4 space-y-3.5 text-admin-sm text-left">
              <div className="flex justify-between items-center">
                <span className="text-admin-text-secondary inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-admin-text-secondary" /> Role
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-admin-content border border-admin-border text-admin-text-primary rounded-admin-sm">
                  {customer.role}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-admin-text-secondary inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-admin-text-secondary" /> Member Since
                </span>
                <span className="font-semibold text-admin-text-primary">
                  {new Date(customer.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics highlight */}
          <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-5 space-y-3 shadow-xs">
            <h3 className="font-bold text-admin-sm text-admin-text-primary border-b border-admin-border pb-3 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-admin-text-secondary" />
              CDP Highlights
            </h3>
            
            <div className="space-y-2.5 text-admin-sm">
              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Loyalty Badge</span>
                <span className="font-semibold text-admin-text-primary inline-flex items-center gap-1 text-admin-xs capitalize">
                  <Award className="h-3.5 w-3.5 text-admin-text-secondary" /> {metrics.customerTier.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-text-secondary">Last Active</span>
                <span className="font-semibold text-admin-text-primary text-admin-xs">
                  {profile.updatedAt 
                    ? new Date(profile.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    : "—"
                  }
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
