"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/admin/ui/DataTable"
import { formatCurrency } from "@/lib/utils"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface UsersClientProps {
  customersData: {
    items: {
      id: string
      email: string
      firstName: string | null
      lastName: string | null
      createdAt: Date
      totalOrders: number
      lifetimeSpend: number
    }[]
    total: number
    totalPages: number
    currentPage: number
  }
  currentSearch: string
}

export function UsersClient({ customersData, currentSearch }: UsersClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [isPending, startTransition] = useTransition()

  const columns = [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }: any) => {
        const item = row.original
        const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ") || "Unnamed Customer"
        return (
          <div className="flex flex-col">
            <span className="font-medium text-admin-text-primary">{fullName}</span>
            <span className="text-admin-xs text-admin-text-secondary font-mono">{item.email}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Join Date",
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
    {
      accessorKey: "totalOrders",
      header: "Orders Placed",
      cell: ({ row }: any) => (
        <span className="text-admin-text-primary font-medium">
          {row.getValue("totalOrders")} order{row.getValue("totalOrders") === 1 ? "" : "s"}
        </span>
      ),
    },
    {
      accessorKey: "lifetimeSpend",
      header: "Lifetime Value",
      cell: ({ row }: any) => (
        <span className="font-bold text-admin-text-primary">
          {formatCurrency(row.getValue("lifetimeSpend"))}
        </span>
      ),
    },
  ]

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
    router.push(`/admin/users/${row.id}`)
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
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-admin-surface border border-admin-border p-4 rounded-admin-lg shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-10 pr-4 py-1.5 text-admin-sm text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
          />
        </form>
      </div>

      {/* Main Table */}
      <div className={cn("transition-opacity duration-150", isPending && "opacity-60")}>
        <DataTable
          columns={columns}
          data={customersData.items}
          onRowClick={handleRowClick}
          emptyStateText="No customers match search parameters."
        />
      </div>

      {/* Pagination Controls */}
      {customersData.totalPages > 1 && (
        <div className="flex justify-between items-center text-admin-sm text-admin-text-secondary pt-2">
          <span>Page {customersData.currentPage} of {customersData.totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={customersData.currentPage === 1}
              onClick={() => handlePageChange(customersData.currentPage - 1)}
              className="px-3 py-1.5 border border-admin-border rounded-admin-md text-admin-xs font-semibold bg-admin-surface hover:bg-admin-content disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <button
              disabled={customersData.currentPage === customersData.totalPages}
              onClick={() => handlePageChange(customersData.currentPage + 1)}
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
