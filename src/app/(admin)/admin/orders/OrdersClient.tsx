"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/admin/ui/DataTable"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { InspectorPanel } from "@/components/admin/ui/InspectorPanel"
import { formatCurrency } from "@/lib/utils"
import { getOrderDetailsAction } from "@/actions/admin/orders"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrdersClientProps {
  ordersData: {
    items: {
      id: string
      orderNumber: string
      status: string
      paymentStatus: string
      total: number
      createdAt: Date
      customerName: string
      customerEmail: string
      itemCount: number
    }[]
    total: number
    totalPages: number
    currentPage: number
  }
  currentStatusTab: string
  currentSearch: string
}

const TABS = [
  { label: "All", id: "all" },
  { label: "Pending", id: "pending" },
  { label: "Processing", id: "processing" },
  { label: "Shipped", id: "shipped" },
  { label: "Delivered", id: "delivered" },
  { label: "Cancelled", id: "cancelled" },
]

export function OrdersClient({ ordersData, currentStatusTab, currentSearch }: OrdersClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isPending, startTransition] = useTransition()

  const columns = [
    {
      accessorKey: "orderNumber",
      header: "Order ID",
      cell: ({ row }: any) => (
        <span className="font-mono font-semibold text-admin-text-primary">
          {row.getValue("orderNumber")}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-admin-text-primary">{row.getValue("customerName")}</span>
          <span className="text-admin-xs text-admin-text-secondary">{row.original.customerEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      cell: ({ row }: any) => `${row.getValue("itemCount")} unit${row.getValue("itemCount") === 1 ? "" : "s"}`,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }: any) => (
        <span className="font-bold text-admin-text-primary">
          {formatCurrency(row.getValue("total"))}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }: any) => (
        <span className="text-admin-text-secondary font-medium">
          {new Date(row.getValue("createdAt")).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ]

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tabId === "all") {
      params.delete("status")
    } else {
      params.set("status", tabId)
    }
    params.set("page", "1")
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput.trim()) {
      params.set("search", searchInput.trim())
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const handleRowClick = async (row: any) => {
    setPanelOpen(true)
    setIsLoadingDetails(true)
    setSelectedOrderDetails(null)
    try {
      const details = await getOrderDetailsAction(row.id)
      setSelectedOrderDetails(details)
    } catch (err) {
      console.error("Failed to load order details", err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const renderShippingAddress = (addressJson: any) => {
    if (!addressJson) return "N/A"
    try {
      const parsed = typeof addressJson === "string" ? JSON.parse(addressJson) : addressJson
      return (
        <div className="space-y-1 text-admin-sm text-admin-text-primary leading-relaxed">
          <p className="font-semibold text-admin-text-primary">{parsed.fullName || "N/A"}</p>
          <p>{parsed.addressLine1}</p>
          {parsed.addressLine2 && <p>{parsed.addressLine2}</p>}
          <p>{[parsed.city, parsed.state, parsed.postalCode].filter(Boolean).join(", ")}</p>
          {parsed.country && <p>{parsed.country}</p>}
          {parsed.phone && <p className="text-admin-xs text-admin-text-secondary mt-1">Phone: {parsed.phone}</p>}
        </div>
      )
    } catch {
      return "Format error"
    }
  }

  const renderDetailsTab = () => {
    if (!selectedOrderDetails) return null
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-admin-xs font-bold text-admin-text-secondary uppercase tracking-wider">Order Items</h4>
          <div className="border border-admin-border rounded-admin-md overflow-hidden bg-admin-content/10 divide-y divide-admin-border">
            {selectedOrderDetails.items?.map((item: any) => (
              <div key={item.id} className="p-3.5 flex justify-between items-center text-admin-sm bg-admin-surface">
                <div className="max-w-[70%]">
                  <p className="font-semibold text-admin-text-primary leading-snug">{item.productName}</p>
                  <p className="text-admin-xs text-admin-text-secondary font-mono mt-1">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-admin-text-primary">{formatCurrency(item.unitPrice)} × {item.quantity}</p>
                  <p className="text-admin-xs text-admin-text-secondary mt-0.5">{formatCurrency(item.totalPrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-admin-content/10 border border-admin-border rounded-admin-md p-4 space-y-2">
            <h4 className="text-admin-xs font-bold text-admin-text-secondary uppercase tracking-wider">Customer Details</h4>
            <div className="text-admin-sm space-y-1">
              <p className="font-semibold text-admin-text-primary">{selectedOrderDetails.customerName}</p>
              <p className="text-admin-text-secondary font-mono text-admin-xs">{selectedOrderDetails.customerEmail}</p>
            </div>
          </div>

          <div className="bg-admin-content/10 border border-admin-border rounded-admin-md p-4 space-y-2">
            <h4 className="text-admin-xs font-bold text-admin-text-secondary uppercase tracking-wider">Payment Details</h4>
            <div className="text-admin-sm space-y-1">
              <p className="text-admin-text-primary">
                Method: <span className="font-semibold">{selectedOrderDetails.paymentMethod}</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-admin-xs text-admin-text-secondary">Payment:</span>
                <span className={cn(
                  "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-admin-sm",
                  selectedOrderDetails.paymentStatus === "PAID"
                    ? "bg-admin-status-success-bg text-admin-status-success-text"
                    : "bg-admin-status-warning-bg text-admin-status-warning-text"
                )}>
                  {selectedOrderDetails.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-admin-content/10 border border-admin-border rounded-admin-md p-4 space-y-2">
          <h4 className="text-admin-xs font-bold text-admin-text-secondary uppercase tracking-wider">Shipping Address</h4>
          {renderShippingAddress(selectedOrderDetails.shippingAddress)}
        </div>

        {selectedOrderDetails.notes && (
          <div className="bg-admin-status-warning-bg/10 border border-admin-status-warning-text/25 p-4 rounded-admin-md space-y-1">
            <h4 className="text-admin-xs font-bold text-admin-status-warning-text uppercase tracking-wider">Customer Order Note</h4>
            <p className="text-admin-sm text-admin-text-primary italic leading-relaxed">"{selectedOrderDetails.notes}"</p>
          </div>
        )}

        <div className="border border-admin-border rounded-admin-md p-4 space-y-2.5 bg-admin-content/20 text-admin-sm">
          <div className="flex justify-between">
            <span className="text-admin-text-secondary">Subtotal</span>
            <span className="font-semibold text-admin-text-primary">{formatCurrency(selectedOrderDetails.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-admin-text-secondary">Shipping Cost</span>
            <span className="font-semibold text-admin-text-primary">{formatCurrency(selectedOrderDetails.shippingCost)}</span>
          </div>
          {selectedOrderDetails.discountAmount > 0 && (
            <div className="flex justify-between text-admin-status-success-text">
              <span>Discounts Applied</span>
              <span className="font-semibold">-{formatCurrency(selectedOrderDetails.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-admin-text-secondary">Est. Taxes</span>
            <span className="font-semibold text-admin-text-primary">{formatCurrency(selectedOrderDetails.taxAmount)}</span>
          </div>
          <div className="h-px bg-admin-border my-1.5" />
          <div className="flex justify-between text-admin-base font-bold text-admin-text-primary">
            <span>Grand Total</span>
            <span>{formatCurrency(selectedOrderDetails.total)}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderTimelineTab = () => {
    if (!selectedOrderDetails) return null
    const history = selectedOrderDetails.activities || []
    if (history.length === 0) {
      return (
        <div className="py-12 text-center text-admin-sm text-admin-text-secondary bg-admin-content/10 border border-admin-border border-dashed rounded-admin-md">
          No recorded order activities found in timeline.
        </div>
      )
    }
    return (
      <div className="relative pl-6 border-l-2 border-admin-border ml-3 py-2 space-y-6">
        {history.map((act: any) => (
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
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {act.newStatus && (
                <p className="text-admin-xs text-admin-text-secondary leading-normal">
                  Status transition: <span className="font-semibold text-admin-text-primary">{act.oldStatus || "N/A"}</span> →{" "}
                  <span className="font-semibold text-admin-text-primary">{act.newStatus}</span>
                </p>
              )}
              {act.performedByName && (
                <p className="text-admin-xs text-admin-text-secondary">
                  Staff actor: <span className="font-semibold text-admin-text-primary">{act.performedByName}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-admin-surface border border-admin-border p-4 rounded-admin-lg shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search order ID or customer..."
            className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-10 pr-4 py-1.5 text-admin-sm text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
          />
        </form>

        {/* Tab Filters grouped by custom definitions */}
        <div className="flex gap-1 overflow-x-auto select-none border-b border-admin-border pb-1 md:pb-0 md:border-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-admin-md text-admin-xs font-semibold transition-colors focus:outline-none whitespace-nowrap",
                currentStatusTab === tab.id
                  ? "bg-admin-primary text-admin-primary-on"
                  : "text-admin-text-secondary hover:bg-admin-content hover:text-admin-text-primary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className={cn("transition-opacity duration-150", isPending && "opacity-60")}>
        <DataTable
          columns={columns}
          data={ordersData.items}
          onRowClick={handleRowClick}
          emptyStateText="No orders match search parameters."
        />
      </div>

      {/* Pagination Controls */}
      {ordersData.totalPages > 1 && (
        <div className="flex justify-between items-center text-admin-sm text-admin-text-secondary pt-2">
          <span>Page {ordersData.currentPage} of {ordersData.totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={ordersData.currentPage === 1}
              onClick={() => handlePageChange(ordersData.currentPage - 1)}
              className="px-3 py-1.5 border border-admin-border rounded-admin-md text-admin-xs font-semibold bg-admin-surface hover:bg-admin-content disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <button
              disabled={ordersData.currentPage === ordersData.totalPages}
              onClick={() => handlePageChange(ordersData.currentPage + 1)}
              className="px-3 py-1.5 border border-admin-border rounded-admin-md text-admin-xs font-semibold bg-admin-surface hover:bg-admin-content disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detailed side drawer */}
      <InspectorPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={selectedOrderDetails ? `Order Detail: ${selectedOrderDetails.orderNumber}` : "Order Loading..."}
        tabs={
          selectedOrderDetails
            ? [
                { label: "Details", content: renderDetailsTab() },
                { label: "Timeline", content: renderTimelineTab() },
                {
                  label: "Notes",
                  content: (
                    <div className="py-12 text-center text-admin-sm text-admin-text-secondary bg-admin-content/10 border border-admin-border border-dashed rounded-admin-md">
                      Admin order notes are not supported (schema currently restricted to customer notes).
                    </div>
                  ),
                },
                { label: "Activity", content: renderTimelineTab() },
              ]
            : undefined
        }
      >
        {isLoadingDetails && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-admin-sm text-admin-text-secondary">
            <div className="animate-spin h-6 w-6 border-2 border-admin-primary border-t-transparent rounded-full" />
            <span>Retrieving transaction log...</span>
          </div>
        )}
      </InspectorPanel>
    </div>
  )
}
