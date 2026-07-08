"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { OrderDetailsDrawer } from "./OrderDetailsDrawer"

type Order = any

export function OrdersTable({ initialData, searchParams }: { initialData: any, searchParams: any }) {
  const router = useRouter()
  const search = useSearchParams()
  const [query, setQuery] = React.useState(searchParams.searchQuery || "")
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(search.toString())
    if (query) {
      params.set("searchQuery", query)
    } else {
      params.delete("searchQuery")
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(search.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleRowClick = (orderId: string) => {
    setSelectedOrderId(orderId)
  }

  const orders = initialData.data || []

  // Grouping logic based on Date
  const groupedOrders = orders.reduce((acc: any, order: any) => {
    const date = new Date(order.createdAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    let group = "Older"
    if (date >= today) {
      group = "Today"
    } else if (date >= yesterday) {
      group = "Yesterday"
    } else if (date >= startOfWeek) {
      group = "Earlier This Week"
    }

    if (!acc[group]) acc[group] = []
    acc[group].push(order)
    return acc
  }, {})

  const groupOrder = ["Today", "Yesterday", "Earlier This Week", "Older"]

  return (
    <div className="flex flex-col gap-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-border rounded-md">
        <form onSubmit={handleSearch} className="relative w-full md:w-96 flex">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search internal ID, invoice, name, phone..."
            className="pl-9 bg-surface w-full"
          />
        </form>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select 
            onChange={(e) => handleFilter("status", e.target.value)}
            value={searchParams.status}
            className="text-xs px-3 py-2 border border-border rounded-md bg-surface text-text-primary outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select 
            onChange={(e) => handleFilter("paymentMethod", e.target.value)}
            value={searchParams.paymentMethod}
            className="text-xs px-3 py-2 border border-border rounded-md bg-surface text-text-primary outline-none"
          >
            <option value="all">All Payments</option>
            <option value="COD">Cash on Delivery</option>
            <option value="ONLINE">Online Payment</option>
          </select>
          
          <select 
            onChange={(e) => handleFilter("sort", e.target.value)}
            value={searchParams.sort}
            className="text-xs px-3 py-2 border border-border rounded-md bg-surface text-text-primary outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_amount">Highest Amount</option>
            <option value="lowest_amount">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Grouped Table List */}
      <div className="bg-white border border-border rounded-md overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-text-secondary text-sm">
            No orders found matching your criteria.
          </div>
        ) : (
          groupOrder.map((group) => {
            const groupData = groupedOrders[group]
            if (!groupData || groupData.length === 0) return null

            return (
              <div key={group}>
                <div className="bg-surface px-4 py-2 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider flex justify-between">
                  <span>{group}</span>
                  <span>{groupData.length} orders</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-white text-[10px] uppercase text-text-secondary tracking-wider">
                        <th className="px-4 py-3 font-medium">#</th>
                        <th className="px-4 py-3 font-medium">Order / Invoice</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupData.map((order: any) => (
                        <tr 
                          key={order.id} 
                          onClick={() => handleRowClick(order.id)}
                          className="border-b border-border/50 hover:bg-surface/50 cursor-pointer transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <span className="text-xs bg-surface px-2 py-1 rounded text-text-secondary font-mono border border-border/50">
                              {(initialData.currentPage - 1) * 20 + orders.findIndex((o: any) => o.id === order.id) + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-text-primary font-mono group-hover:text-accent transition-colors">
                                {order.orderNumber}
                              </span>
                              {order.invoiceNumber && (
                                <span className="text-xs text-text-secondary font-mono">
                                  {order.invoiceNumber}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-text-primary capitalize">
                                {order.shippingAddress?.fullName || "N/A"}
                              </span>
                              <span className="text-xs text-text-secondary font-mono">
                                {order.shippingAddress?.phone || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm text-text-primary">
                                {new Date(order.createdAt).toLocaleDateString("en-GB")}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {new Date(order.createdAt).toLocaleTimeString("en-GB", {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1 items-start">
                              <StatusBadge status={order.status} />
                              <span className="text-[10px] uppercase text-text-secondary tracking-wider">
                                {order.paymentProvider === "CASH_ON_DELIVERY" ? "COD" : "Online"} • {order.paymentStatus}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-mono font-semibold text-text-primary">
                              {formatCurrency(order.total)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination Controls */}
      {initialData.totalPages > 1 && (
        <div className="flex justify-between items-center py-4 text-sm text-text-secondary">
          <span>Page {initialData.currentPage} of {initialData.totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.currentPage === 1}
              onClick={() => handleFilter("page", String(initialData.currentPage - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.currentPage === initialData.totalPages}
              onClick={() => handleFilter("page", String(initialData.currentPage + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Slide-out Drawer */}
      <OrderDetailsDrawer 
        orderId={selectedOrderId} 
        onClose={() => setSelectedOrderId(null)} 
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let colors = "bg-gray-100 text-gray-700 border-gray-200"
  
  switch(status) {
    case "PENDING":
    case "PENDING_PAYMENT":
      colors = "bg-yellow-50 text-yellow-700 border-yellow-200"
      break
    case "CONFIRMED":
    case "PROCESSING":
      colors = "bg-blue-50 text-blue-700 border-blue-200"
      break
    case "PACKED":
      colors = "bg-indigo-50 text-indigo-700 border-indigo-200"
      break
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      colors = "bg-purple-50 text-purple-700 border-purple-200"
      break
    case "DELIVERED":
      colors = "bg-green-50 text-green-700 border-green-200"
      break
    case "CANCELLED":
    case "REFUNDED":
      colors = "bg-red-50 text-red-700 border-red-200"
      break
  }

  return (
    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${colors}`}>
      {status.replace(/_/g, " ")}
    </span>
  )
}
