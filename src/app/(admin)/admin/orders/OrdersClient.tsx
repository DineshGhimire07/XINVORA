"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/admin/ui/DataTable"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { formatCurrency } from "@/lib/utils"
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
  const [isPending, startTransition] = useTransition()

  const columns = [
    {
      accessorKey: "orderNumber",
      header: "Order ID",
      cell: ({ row }: any) => {
        const imgUrl = row.original.imageUrl
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-8 bg-admin-content border border-admin-border rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
              {imgUrl ? (
                <img src={imgUrl} alt="Order Item" className="h-full w-full object-cover object-top" />
              ) : (
                <div className="text-[7px] uppercase font-bold text-admin-text-secondary">XINV</div>
              )}
            </div>
            <span className="font-mono font-semibold text-admin-text-primary">
              {row.getValue("orderNumber")}
            </span>
          </div>
        )
      },
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
      cell: ({ row }: any) => {
        const dateObj = new Date(row.getValue("createdAt"))
        const dateStr = dateObj.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        const timeStr = dateObj.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        return (
          <div className="flex flex-col text-left">
            <span className="text-admin-text-secondary font-medium">{dateStr}</span>
            <span className="text-[10px] text-admin-text-secondary font-mono mt-0.5">{timeStr}</span>
          </div>
        )
      },
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

  const handleRowClick = (row: any) => {
    router.push(`/admin/orders/${row.id}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
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

        {/* Tab Filters */}
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
    </div>
  )
}
