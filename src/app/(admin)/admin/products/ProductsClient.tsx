"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/admin/ui/DataTable"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { formatCurrency } from "@/lib/utils"
import { Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { DeleteProductButton } from "@/components/admin/DeleteProductButton"

interface ProductsClientProps {
  productsData: {
    items: {
      id: string
      name: string
      slug: string
      status: string
      createdAt: Date
      categoryName: string | null
      price: number
      stock: number
      productImages: { url: string }[]
      collections: string
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
  { label: "Published", id: "published" },
  { label: "Draft", id: "draft" },
  { label: "Archived", id: "archived" },
]

export function ProductsClient({ productsData, currentStatusTab, currentSearch }: ProductsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [isPending, startTransition] = useTransition()

  const columns = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }: any) => {
        const item = row.original
        const imageUrl = item.productImages?.[0]?.url
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-12 bg-admin-content/20 border border-admin-border overflow-hidden shrink-0 select-none rounded-admin-sm">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[7px] text-admin-text-secondary uppercase select-none font-bold">
                  No Image
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-admin-text-primary leading-tight hover:text-admin-primary transition-colors">
                {item.name}
              </span>
              <span className="text-admin-xs text-admin-text-secondary font-mono mt-0.5">{item.slug}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }: any) => (
        <span className="text-admin-text-primary font-medium">
          {row.getValue("categoryName") || "--"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const rawStatus = row.getValue("status")
        return <StatusBadge status={rawStatus} />
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: any) => (
        <span className="font-mono text-admin-text-primary font-medium">
          {row.getValue("price") > 0 ? formatCurrency(row.getValue("price")) : "--"}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock Level",
      cell: ({ row }: any) => {
        const qty = row.getValue("stock")
        if (qty === 0) return <span className="text-admin-status-danger-text font-bold text-admin-xs">Out of stock</span>
        if (qty < 5) return <span className="text-admin-status-warning-text font-semibold text-admin-xs">Low stock ({qty})</span>
        return <span className="text-admin-text-secondary text-admin-xs">{qty} units</span>
      },
    },
    {
      accessorKey: "collections",
      header: "Collections",
      cell: ({ row }: any) => {
        const collectionStr = row.original.collections
        const collectionList = collectionStr ? collectionStr.split(", ").filter(Boolean) : []
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {collectionList.length > 0 ? (
              collectionList.map((colName: string, i: number) => {
                const colors = [
                  "bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]",
                  "bg-[#FFF7ED] text-[#9A3412] border-[#FFEDD5]",
                  "bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]",
                  "bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]",
                  "bg-[#F0FDFA] text-[#0F766E] border-[#CCFBF1]",
                  "bg-[#EFF6FF] text-[#1E40AF] border-[#DBEAFE]",
                  "bg-[#F5F3FF] text-[#5B21B6] border-[#EDE9FE]",
                  "bg-[#FDF2F8] text-[#9D174D] border-[#FCE7F3]"
                ]
                let hash = 0
                for (let c = 0; c < colName.length; c++) {
                  hash = colName.charCodeAt(c) + ((hash << 5) - hash)
                }
                const colorClass = colors[Math.abs(hash) % colors.length]
                return (
                  <span
                    key={i}
                    className={cn(
                      "text-[9px] font-semibold px-2 py-0.5 rounded-full border tracking-wide whitespace-nowrap",
                      colorClass
                    )}
                  >
                    {colName}
                  </span>
                )
              })
            ) : (
              <span className="text-admin-xs text-admin-text-secondary/50">—</span>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => {
        const item = row.original
        return (
          <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
            <Link
              href={`/admin/products/${item.id}`}
              className="text-admin-xs uppercase tracking-wider font-bold text-admin-text-secondary hover:text-admin-primary transition-colors"
            >
              Edit
            </Link>
            <DeleteProductButton productId={item.id} productName={item.name} />
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
      params.set("status", tabId.toUpperCase())
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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const handleRowClick = (row: any) => {
    router.push(`/admin/products/${row.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-admin-surface border border-admin-border p-4 rounded-admin-lg shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name..."
            className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-10 pr-4 py-1.5 text-admin-sm text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
          />
        </form>

        <div className="flex gap-1 overflow-x-auto select-none border-b border-admin-border pb-1 md:pb-0 md:border-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-admin-md text-admin-xs font-semibold transition-colors focus:outline-none whitespace-nowrap",
                currentStatusTab.toLowerCase() === tab.id
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
          data={productsData.items}
          onRowClick={handleRowClick}
          emptyStateText="No products found."
        />
      </div>

      {/* Pagination Controls */}
      {productsData.totalPages > 1 && (
        <div className="flex justify-between items-center text-admin-sm text-admin-text-secondary pt-2">
          <span>Page {productsData.currentPage} of {productsData.totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={productsData.currentPage === 1}
              onClick={() => handlePageChange(productsData.currentPage - 1)}
              className="px-3 py-1.5 border border-admin-border rounded-admin-md text-admin-xs font-semibold bg-admin-surface hover:bg-admin-content disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <button
              disabled={productsData.currentPage === productsData.totalPages}
              onClick={() => handlePageChange(productsData.currentPage + 1)}
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
