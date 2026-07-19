"use client"

import { useState, useTransition, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Copy,
  X,
  Tag,
  ChevronDown,
  Check,
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import {
  addToOffSectionAction,
  updateOffSectionAction,
  toggleOffStatusAction,
  removeFromOffSectionAction,
} from "@/actions/admin/off-section.actions"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface OffSectionItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  sku: string | null
  categoryName: string | null
  thumbnailUrl: string | null
  originalPrice: number
  sellingPrice: number
  currentPrice: number | null
  isOffEnabled: boolean
  createdAt: Date
}

interface ProductOption {
  id: string
  name: string
  slug: string
  productImages: { url: string }[]
}

interface CategoryOption {
  id: string
  name: string
}

interface OffSectionClientProps {
  offSectionData: {
    items: OffSectionItem[]
    total: number
    totalPages: number
    currentPage: number
  }
  allProducts: ProductOption[]
  allCategories: CategoryOption[]
  currentSearch: string
  currentStatus: string
  currentCategoryId: string
}

// ─── Status Tabs ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All", id: "all" },
  { label: "Active", id: "active" },
  { label: "Inactive", id: "inactive" },
]

// ─── Main Component ─────────────────────────────────────────────────────────────

export function OffSectionClient({
  offSectionData,
  allProducts,
  allCategories,
  currentSearch,
  currentStatus,
  currentCategoryId,
}: OffSectionClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editOriginal, setEditOriginal] = useState("")
  const [editSelling, setEditSelling] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // ── Navigation helpers ──────────────────────────────────────────────────────

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      params.set("page", "1")
      startTransition(() => router.push(`?${params.toString()}`))
    },
    [searchParams, router]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    pushParams({ search: searchInput.trim() || null })
  }

  const handleTabChange = (tabId: string) => {
    pushParams({ status: tabId === "all" ? null : tabId })
  }

  const handleCategoryFilter = (categoryId: string) => {
    pushParams({ categoryId: categoryId || null })
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    startTransition(() => router.push(`?${params.toString()}`))
  }

  // ── Inline editing ────────────────────────────────────────────────────────

  const startEdit = (item: OffSectionItem) => {
    setEditingId(item.id)
    setEditOriginal(String(item.originalPrice / 100))
    setEditSelling(String(item.sellingPrice / 100))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditOriginal("")
    setEditSelling("")
  }

  const saveEdit = async () => {
    if (!editingId) return
    const originalPrice = parseFloat(editOriginal)
    const sellingPrice = parseFloat(editSelling)

    if (isNaN(originalPrice) || isNaN(sellingPrice) || originalPrice <= 0 || sellingPrice <= 0) {
      showToast("Please enter valid prices.")
      return
    }
    if (originalPrice <= sellingPrice) {
      showToast("Original price must be greater than selling price.")
      return
    }

    const result = await updateOffSectionAction(editingId, { originalPrice, sellingPrice })
    if (result.success) {
      showToast("Prices updated successfully.")
      cancelEdit()
      router.refresh()
    } else {
      showToast(result.error || "Failed to update.")
    }
  }

  // ── Toggle status ─────────────────────────────────────────────────────────

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    const result = await toggleOffStatusAction(id, !currentEnabled)
    if (result.success) {
      router.refresh()
    } else {
      showToast(result.error || "Failed to toggle status.")
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from Off Section?`)) return
    const result = await removeFromOffSectionAction(id)
    if (result.success) {
      showToast("Product removed from Off Section.")
      router.refresh()
    } else {
      showToast(result.error || "Failed to remove.")
    }
  }

  // ── Toast ─────────────────────────────────────────────────────────────────

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const existingProductIds = useMemo(
    () => new Set(offSectionData.items.map((i) => i.productId)),
    [offSectionData.items]
  )

  return (
    <>
      <div className="space-y-6">
        {/* ── Controls Bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-admin-surface border border-admin-border p-4 rounded-[16px] shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-admin-content border border-admin-border rounded-[14px] pl-10 pr-4 py-2 text-admin-sm text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </form>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={currentCategoryId}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="appearance-none bg-admin-content border border-admin-border rounded-[14px] pl-4 pr-10 py-2 text-admin-sm text-admin-text-primary focus:outline-none focus:border-admin-border-strong cursor-pointer min-w-[160px]"
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Tabs */}
            <div className="flex gap-1 select-none">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-[14px] text-admin-xs font-semibold transition-colors focus:outline-none whitespace-nowrap",
                    currentStatus === tab.id
                      ? "bg-admin-primary text-admin-primary-on"
                      : "text-admin-text-secondary hover:bg-admin-content hover:text-admin-text-primary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 px-5 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-[14px] transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "bg-admin-surface border border-admin-border rounded-[16px] overflow-hidden shadow-xs transition-opacity duration-150",
            isPending && "opacity-60"
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-admin-border bg-admin-content/30">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary">
                    Product
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary">
                    Selling Price
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary">
                    Original Price
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary">
                    Discount
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary">
                    OFF %
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {offSectionData.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-admin-content/50 flex items-center justify-center">
                          <Tag className="h-5 w-5 text-admin-text-secondary/50" />
                        </div>
                        <p className="text-admin-sm text-admin-text-secondary">
                          No products in Off Section yet.
                        </p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="text-admin-xs font-bold text-admin-primary hover:text-admin-primary/80 uppercase tracking-wider transition-colors"
                        >
                          + Add your first product
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  offSectionData.items.map((item) => {
                    const discountAmount = item.originalPrice - item.sellingPrice
                    const discountPercent =
                      item.originalPrice > 0
                        ? Math.round(
                            ((item.originalPrice - item.sellingPrice) / item.originalPrice) * 100
                          )
                        : 0
                    const isEditing = editingId === item.id

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-admin-content/20 transition-colors"
                      >
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 bg-admin-content/20 border border-admin-border overflow-hidden shrink-0 rounded-[8px]">
                              {item.thumbnailUrl ? (
                                <Image
                                  src={item.thumbnailUrl}
                                  alt={item.productName}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[7px] text-admin-text-secondary uppercase font-bold">
                                  No Img
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-admin-sm text-admin-text-primary leading-tight truncate max-w-[200px]">
                                {item.productName}
                              </span>
                              {item.sku && (
                                <span className="text-[10px] text-admin-text-secondary/70 font-mono mt-0.5">
                                  SKU: {item.sku}
                                </span>
                              )}
                              {item.categoryName && (
                                <span className="text-[10px] text-admin-text-secondary/60 mt-0.5">
                                  {item.categoryName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Selling Price */}
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editSelling}
                              onChange={(e) => setEditSelling(e.target.value)}
                              className="w-28 bg-admin-content border border-admin-border rounded-[8px] px-3 py-1.5 text-admin-sm font-mono text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-admin-primary"
                              step="1"
                              min="1"
                            />
                          ) : (
                            <span className="font-mono text-admin-sm font-semibold text-admin-text-primary">
                              {formatCurrency(item.sellingPrice)}
                            </span>
                          )}
                        </td>

                        {/* Original Price */}
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editOriginal}
                              onChange={(e) => setEditOriginal(e.target.value)}
                              className="w-28 bg-admin-content border border-admin-border rounded-[8px] px-3 py-1.5 text-admin-sm font-mono text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-admin-primary"
                              step="1"
                              min="1"
                            />
                          ) : (
                            <span className="font-mono text-admin-sm text-admin-text-secondary line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                          )}
                        </td>

                        {/* Discount Amount */}
                        <td className="px-5 py-4">
                          <span className="font-mono text-admin-sm text-emerald-600 font-medium">
                            {isEditing
                              ? (() => {
                                  const o = parseFloat(editOriginal) * 100
                                  const s = parseFloat(editSelling) * 100
                                  return !isNaN(o) && !isNaN(s) && o > s
                                    ? formatCurrency(o - s)
                                    : "—"
                                })()
                              : formatCurrency(discountAmount)}
                          </span>
                        </td>

                        {/* OFF % */}
                        <td className="px-5 py-4">
                          {(() => {
                            let pct = discountPercent
                            if (isEditing) {
                              const o = parseFloat(editOriginal)
                              const s = parseFloat(editSelling)
                              pct =
                                !isNaN(o) && !isNaN(s) && o > s
                                  ? Math.round(((o - s) / o) * 100)
                                  : 0
                            }
                            return pct > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-bold text-white bg-[#D92D20]">
                                {pct}% OFF
                              </span>
                            ) : (
                              <span className="text-admin-text-secondary text-admin-xs">—</span>
                            )
                          })()}
                        </td>

                        {/* Status Toggle */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggle(item.id, item.isOffEnabled)}
                            className="group flex items-center gap-2"
                          >
                            <div
                              className={cn(
                                "relative w-10 h-[22px] rounded-full transition-colors duration-200",
                                item.isOffEnabled
                                  ? "bg-emerald-500"
                                  : "bg-admin-border"
                              )}
                            >
                              <div
                                className={cn(
                                  "absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200",
                                  item.isOffEnabled
                                    ? "translate-x-[20px]"
                                    : "translate-x-[2px]"
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                item.isOffEnabled
                                  ? "text-emerald-600"
                                  : "text-admin-text-secondary"
                              )}
                            >
                              {item.isOffEnabled ? "Active" : "Inactive"}
                            </span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  className="p-1.5 rounded-[8px] text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  title="Save"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1.5 rounded-[8px] text-admin-text-secondary hover:bg-admin-content transition-colors"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(item)}
                                  className="p-1.5 rounded-[8px] text-admin-text-secondary hover:text-admin-primary hover:bg-admin-content transition-colors"
                                  title="Edit prices"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(item.id, item.productName)
                                  }
                                  className="p-1.5 rounded-[8px] text-admin-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Remove from Off Section"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {offSectionData.totalPages > 1 && (
          <div className="flex justify-between items-center text-admin-sm text-admin-text-secondary pt-1">
            <span>
              Page {offSectionData.currentPage} of {offSectionData.totalPages}
              <span className="ml-2 text-admin-text-secondary/60">
                ({offSectionData.total} products)
              </span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={offSectionData.currentPage === 1}
                onClick={() => handlePageChange(offSectionData.currentPage - 1)}
                className="px-4 py-1.5 border border-admin-border rounded-[14px] text-admin-xs font-semibold bg-admin-surface hover:bg-admin-content disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              {/* Page number buttons */}
              {Array.from({ length: Math.min(offSectionData.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-[10px] text-admin-xs font-semibold transition-colors",
                      offSectionData.currentPage === pageNum
                        ? "bg-admin-primary text-admin-primary-on"
                        : "border border-admin-border bg-admin-surface hover:bg-admin-content text-admin-text-secondary"
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                disabled={offSectionData.currentPage === offSectionData.totalPages}
                onClick={() => handlePageChange(offSectionData.currentPage + 1)}
                className="px-4 py-1.5 border border-admin-border rounded-[14px] text-admin-xs font-semibold bg-admin-surface hover:bg-admin-content disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ── Info Card ───────────────────────────────────────────────────── */}
        <div className="border border-[#C9A96A]/30 bg-[#FDFAF4] rounded-[16px] p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#C9A96A]/10 flex items-center justify-center flex-shrink-0">
              <Tag className="h-4.5 w-4.5 text-[#C9A96A]" />
            </div>
            <div>
              <h3 className="text-admin-sm font-bold text-admin-text-primary tracking-tight">
                How Off Section Works
              </h3>
              <p className="text-admin-xs text-admin-text-secondary mt-1.5 leading-relaxed max-w-2xl">
                Products added here automatically display:
              </p>
              <ul className="mt-2 space-y-1 text-admin-xs text-admin-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C9A96A]" />
                  Original Price (strikethrough)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C9A96A]" />
                  Selling Price
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C9A96A]" />
                  OFF badge with calculated percentage
                </li>
              </ul>
              <p className="text-admin-xs text-admin-text-secondary/70 mt-3 leading-relaxed max-w-2xl">
                Changes instantly reflect across Product Cards, Collections, Search Results
                and Product Detail Pages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Product Modal ───────────────────────────────────────────── */}
      {showAddModal && (
        <AddProductModal
          products={allProducts}
          existingProductIds={existingProductIds}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            showToast("Product added to Off Section.")
            router.refresh()
          }}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-admin-text-primary text-white px-5 py-3 rounded-[14px] shadow-lg text-admin-sm font-medium animate-in slide-in-from-bottom-2 fade-in duration-200">
          {toastMessage}
        </div>
      )}
    </>
  )
}

// ─── Add Product Modal ──────────────────────────────────────────────────────────

function AddProductModal({
  products,
  existingProductIds,
  onClose,
  onSuccess,
}: {
  products: ProductOption[]
  existingProductIds: Set<string>
  onClose: () => void
  onSuccess: () => void
}) {
  const [search, setSearch] = useState("")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [originalPrice, setOriginalPrice] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredProducts = products.filter((p) => {
    if (existingProductIds.has(p.id)) return false
    if (!search.trim()) return true
    return p.name.toLowerCase().includes(search.toLowerCase())
  })

  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId)
    : null

  const discountPercent = useMemo(() => {
    const o = parseFloat(originalPrice)
    const s = parseFloat(sellingPrice)
    if (!isNaN(o) && !isNaN(s) && o > s && o > 0) {
      return Math.round(((o - s) / o) * 100)
    }
    return 0
  }, [originalPrice, sellingPrice])

  const discountAmount = useMemo(() => {
    const o = parseFloat(originalPrice)
    const s = parseFloat(sellingPrice)
    if (!isNaN(o) && !isNaN(s) && o > s) {
      return o - s
    }
    return 0
  }, [originalPrice, sellingPrice])

  const handleSubmit = async () => {
    if (!selectedProductId) {
      setError("Please select a product.")
      return
    }
    const o = parseFloat(originalPrice)
    const s = parseFloat(sellingPrice)
    if (isNaN(o) || o <= 0) {
      setError("Enter a valid original price.")
      return
    }
    if (isNaN(s) || s <= 0) {
      setError("Enter a valid selling price.")
      return
    }
    if (o <= s) {
      setError("Original price must be greater than selling price.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await addToOffSectionAction({
      productId: selectedProductId,
      originalPrice: o,
      sellingPrice: s,
    })

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || "Failed to add product.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="bg-admin-surface border border-admin-border rounded-[16px] shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-border">
          <h2 className="text-admin-base font-bold text-admin-text-primary tracking-tight">
            Add Product to Off Section
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[8px] hover:bg-admin-content text-admin-text-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Product Picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary">
              Select Product
            </label>
            {selectedProduct ? (
              <div className="flex items-center justify-between p-3 border border-admin-border bg-admin-content/30 rounded-[12px]">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-11 bg-admin-content/20 border border-admin-border/50 rounded-[6px] overflow-hidden flex-shrink-0">
                    {selectedProduct.productImages?.[0]?.url ? (
                      <Image
                        src={selectedProduct.productImages[0].url}
                        alt={selectedProduct.name}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[6px] text-admin-text-secondary uppercase font-bold">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-admin-sm font-semibold text-admin-text-primary">
                      {selectedProduct.name}
                    </span>
                    <span className="text-[10px] text-admin-text-secondary/60 font-mono">
                      {selectedProduct.slug}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProductId(null)}
                  className="text-admin-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-admin-content border border-admin-border rounded-[12px] pl-10 pr-4 py-2.5 text-admin-sm text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:ring-1 focus:ring-admin-primary transition-all"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-admin-border rounded-[12px] bg-admin-content/20 divide-y divide-admin-border/30">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.slice(0, 20).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProductId(p.id)
                          setSearch("")
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-admin-content/40 transition-colors text-left"
                      >
                        <div className="relative w-7 h-9 bg-admin-content/20 border border-admin-border/50 rounded-[4px] overflow-hidden flex-shrink-0">
                          {p.productImages?.[0]?.url ? (
                            <Image
                              src={p.productImages[0].url}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[5px] text-admin-text-secondary uppercase font-bold">
                              ?
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-admin-xs font-semibold text-admin-text-primary truncate">
                            {p.name}
                          </span>
                          <span className="text-[9px] text-admin-text-secondary/50 font-mono">
                            {p.slug}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-admin-xs text-admin-text-secondary/50 italic">
                      {search
                        ? "No matching products found."
                        : "All published products are already in Off Section."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Price Inputs */}
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary">
                    Original Price (NPR)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="3499"
                    className="w-full bg-admin-content border border-admin-border rounded-[12px] px-4 py-2.5 text-admin-sm font-mono text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-admin-primary transition-all"
                    step="1"
                    min="1"
                  />
                  <p className="text-[9px] text-admin-text-secondary/60">
                    The crossed-out price shown on cards
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-admin-text-secondary">
                    Selling Price (NPR)
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="2499"
                    className="w-full bg-admin-content border border-admin-border rounded-[12px] px-4 py-2.5 text-admin-sm font-mono text-admin-text-primary focus:outline-none focus:ring-1 focus:ring-admin-primary transition-all"
                    step="1"
                    min="1"
                  />
                  <p className="text-[9px] text-admin-text-secondary/60">
                    The price customers actually pay
                  </p>
                </div>
              </div>

              {/* Live Preview */}
              {discountPercent > 0 && (
                <div className="flex items-center gap-4 p-4 bg-admin-content/30 border border-admin-border/50 rounded-[12px]">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-[6px] text-[12px] font-bold text-white bg-[#D92D20]">
                    {discountPercent}% OFF
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-admin-sm font-mono line-through text-admin-text-secondary">
                      NPR {parseFloat(originalPrice).toLocaleString()}
                    </span>
                    <span className="text-admin-base font-mono font-bold text-admin-text-primary">
                      NPR {parseFloat(sellingPrice).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-admin-xs text-emerald-600 font-medium ml-auto">
                    Save NPR {discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-admin-xs text-red-500 font-medium">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-admin-border bg-admin-content/20">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-admin-border rounded-[12px] text-admin-xs font-bold uppercase tracking-wider text-admin-text-secondary hover:bg-admin-content transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedProductId}
            className="px-5 py-2 bg-admin-primary text-admin-primary-on rounded-[12px] text-admin-xs font-bold uppercase tracking-wider hover:bg-admin-primary/95 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add to Off Section"}
          </button>
        </div>
      </div>
    </div>
  )
}
