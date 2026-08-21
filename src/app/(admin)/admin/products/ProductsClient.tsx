"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/admin/ui/DataTable"
import { formatCurrency } from "@/lib/utils"
import { Search, Trash2, CheckSquare, Square, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { DeleteProductButton } from "@/components/admin/DeleteProductButton"
import { quickUpdateProductAction, bulkDeleteProductsAction } from "@/actions/admin/products.actions"

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

function InlineStatusCell({ productId, initialStatus }: { productId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return
    const prev = status
    setStatus(newStatus)
    setIsSaving(true)
    const res = await quickUpdateProductAction(productId, { status: newStatus as any })
    setIsSaving(false)
    if (!res.success) {
      setStatus(prev)
      alert(res.error || "Failed to update status")
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
      <select
        value={status}
        disabled={isSaving}
        onChange={(e) => handleChange(e.target.value)}
        className={`px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-full border cursor-pointer focus:outline-none transition-all ${
          status === "PUBLISHED"
            ? "bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20"
            : status === "DRAFT"
            ? "bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/20"
            : "bg-gray-500/10 text-gray-700 border-gray-500/30 hover:bg-gray-500/20"
        }`}
      >
        <option value="PUBLISHED" className="bg-admin-content text-admin-text-primary">PUBLISHED</option>
        <option value="DRAFT" className="bg-admin-content text-admin-text-primary">DRAFT</option>
        <option value="ARCHIVED" className="bg-admin-content text-admin-text-primary">ARCHIVED</option>
      </select>
      {isSaving && <div className="w-3 h-3 rounded-full border-2 border-admin-primary border-t-transparent animate-spin" />}
    </div>
  )
}

function InlinePriceCell({ productId, initialPrice }: { productId: string; initialPrice: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [price, setPrice] = useState(initialPrice)
  const [inputValue, setInputValue] = useState(initialPrice.toString())
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = async () => {
    setIsEditing(false)
    const num = parseFloat(inputValue)
    if (isNaN(num) || num === price) return

    setIsSaving(true)
    const res = await quickUpdateProductAction(productId, { price: num })
    setIsSaving(false)

    if (res.success) {
      setPrice(num)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)
    } else {
      setInputValue(price.toString())
      alert(res.error || "Failed to update price")
    }
  }

  if (isEditing) {
    return (
      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
        <span className="text-admin-xs text-admin-text-secondary font-mono">NPR</span>
        <input
          type="number"
          step="1"
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave()
            if (e.key === "Escape") {
              setInputValue(price.toString())
              setIsEditing(false)
            }
          }}
          onBlur={handleSave}
          className="w-24 px-2 py-1 text-admin-xs font-mono font-bold bg-admin-content border-2 border-admin-primary rounded text-admin-text-primary focus:outline-none shadow-sm"
        />
      </div>
    )
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        setIsEditing(true)
      }}
      title="Click to edit price directly"
      className="group flex items-center gap-1.5 cursor-pointer py-1 px-1.5 -ml-1.5 rounded hover:bg-admin-content-hover/60 transition-colors"
    >
      <span className="font-mono text-admin-text-primary font-bold">
        {price > 0 ? formatCurrency(price) : "NPR 0"}
      </span>
      {isSaving ? (
        <div className="w-3 h-3 rounded-full border-2 border-admin-primary border-t-transparent animate-spin" />
      ) : savedSuccess ? (
        <span className="text-green-600 text-xs font-bold animate-in fade-in">✓</span>
      ) : (
        <span className="text-[10px] text-admin-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
      )}
    </div>
  )
}

function InlineStockCell({ productId, initialStock }: { productId: string; initialStock: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [stock, setStock] = useState(initialStock)
  const [inputValue, setInputValue] = useState(initialStock.toString())
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = async () => {
    setIsEditing(false)
    const num = parseInt(inputValue, 10)
    if (isNaN(num) || num === stock) return

    setIsSaving(true)
    const res = await quickUpdateProductAction(productId, { stock: num })
    setIsSaving(false)

    if (res.success) {
      setStock(num)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)
    } else {
      setInputValue(stock.toString())
      alert(res.error || "Failed to update stock")
    }
  }

  if (isEditing) {
    return (
      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          step="1"
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave()
            if (e.key === "Escape") {
              setInputValue(stock.toString())
              setIsEditing(false)
            }
          }}
          onBlur={handleSave}
          className="w-20 px-2 py-1 text-admin-xs font-bold bg-admin-content border-2 border-admin-primary rounded text-admin-text-primary focus:outline-none shadow-sm"
        />
      </div>
    )
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        setIsEditing(true)
      }}
      title="Click to edit stock quantity directly"
      className="group flex items-center gap-1.5 cursor-pointer py-1 px-1.5 -ml-1.5 rounded hover:bg-admin-content-hover/60 transition-colors"
    >
      {stock === 0 ? (
        <span className="text-admin-status-danger-text font-bold text-admin-xs">Out of stock ({stock})</span>
      ) : stock < 5 ? (
        <span className="text-amber-600 font-bold text-admin-xs">Low stock ({stock})</span>
      ) : (
        <span className="text-admin-text-primary font-semibold text-admin-xs">{stock} units</span>
      )}

      {isSaving ? (
        <div className="w-3 h-3 rounded-full border-2 border-admin-primary border-t-transparent animate-spin" />
      ) : savedSuccess ? (
        <span className="text-green-600 text-xs font-bold animate-in fade-in">✓</span>
      ) : (
        <span className="text-[10px] text-admin-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
      )}
    </div>
  )
}

export function ProductsClient({ productsData, currentStatusTab, currentSearch }: ProductsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [itemsList, setItemsList] = useState(productsData.items)

  useEffect(() => {
    setItemsList(productsData.items)
  }, [productsData.items])

  const allIds = itemsList.map(p => p.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id))
  const someSelected = selectedIds.size > 0

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allIds))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    const idsToDelete = Array.from(selectedIds)
    const confirmed = window.confirm(
      `Permanently delete ${idsToDelete.length} product${idsToDelete.length > 1 ? 's' : ''}? This cannot be undone.`
    )
    if (!confirmed) return
    setIsBulkDeleting(true)
    const res = await bulkDeleteProductsAction(idsToDelete)
    setIsBulkDeleting(false)
    if (res.success) {
      setItemsList(prev => prev.filter(p => !selectedIds.has(p.id)))
      setSelectedIds(new Set())
      router.refresh()
    } else {
      alert(res.error || 'Bulk delete failed')
    }
  }

  const columns = [
    {
      id: "select",
      header: () => (
        <button
          onClick={toggleSelectAll}
          className="flex items-center justify-center w-5 h-5 text-admin-text-secondary hover:text-admin-primary transition-colors"
          title={allSelected ? "Deselect all" : "Select all"}
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-admin-primary" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
      ),
      cell: ({ row }: any) => {
        const id = row.original.id
        const isSelected = selectedIds.has(id)
        return (
          <button
            onClick={(e) => { e.stopPropagation(); toggleSelectOne(id) }}
            className="flex items-center justify-center w-5 h-5 text-admin-text-secondary hover:text-admin-primary transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-admin-primary" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        )
      },
    },
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
      cell: ({ row }: any) => (
        <InlineStatusCell productId={row.original.id} initialStatus={row.getValue("status")} />
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: any) => (
        <InlinePriceCell productId={row.original.id} initialPrice={row.getValue("price") || 0} />
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock Level",
      cell: ({ row }: any) => (
        <InlineStockCell productId={row.original.id} initialStock={row.getValue("stock") || 0} />
      ),
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
            <DeleteProductButton 
              productId={item.id} 
              productName={item.name} 
              onDeleted={() => setItemsList(prev => prev.filter(p => p.id !== item.id))}
            />
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
      {/* Bulk Delete Toolbar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-4 py-3 bg-admin-primary/10 border border-admin-primary/20 rounded-admin-lg animate-in slide-in-from-top-2 duration-200">
          <span className="text-admin-sm font-semibold text-admin-primary">
            {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-admin-md hover:bg-red-600 disabled:opacity-60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isBulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size}`}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="flex items-center gap-1 ml-auto text-admin-xs text-admin-text-secondary hover:text-admin-text-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear selection
          </button>
        </div>
      )}

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
          data={itemsList}
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
