"use client"

import React, { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  setVariantStockAction,
  quickAdjustStockAction,
  bulkSetStockAction,
  deleteInventoryAction,
  syncAndCleanInventoryAction,
} from "@/actions/admin/inventory.actions"

interface InventoryItem {
  id: string
  variantId: string
  sku: string
  quantity: number
  reserved: number
  lowStockThreshold: number
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"
  updatedAt: Date
  productId: string
  productName: string
  productSlug: string
  productStatus: string
  categoryName: string | null
  colorId: string | null
  color: string | null
  colorHex: string | null
  sizeId: string | null
  size: string | null
  sizeAbbr: string | null
  imageUrl: string | null
  price: number
}

interface InventoryStats {
  totalVariants: number
  totalPhysicalStock: number
  inStockCount: number
  lowStockCount: number
  outOfStockCount: number
}

interface InventoryClientProps {
  initialItems: InventoryItem[]
  totalItems: number
  totalPages: number
  currentPage: number
  stats: InventoryStats
  categories: { id: string; name: string }[]
  currentSearch: string
  currentStatus: string
  currentCategory: string
  currentSortBy: string
  currentSortOrder: string
}

export function InventoryClient({
  initialItems,
  totalItems,
  totalPages,
  currentPage,
  stats,
  categories,
  currentSearch,
  currentStatus,
  currentCategory,
  currentSortBy,
  currentSortOrder,
}: InventoryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchVal, setSearchVal] = useState(currentSearch)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [tempStockVal, setTempStockVal] = useState<string>("")
  const [bulkStockVal, setBulkStockVal] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ text, type })
    setTimeout(() => setActionMessage(null), 4000)
  }

  // Update query params
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === "") {
        params.delete(k)
      } else {
        params.set(k, v)
      }
    })
    params.delete("page") // Reset page when filtering
    router.push(`/admin/inventory?${params.toString()}`)
  }

  // Handle direct inline stock save
  const handleSaveInlineStock = async (item: InventoryItem) => {
    const num = parseInt(tempStockVal, 10)
    setEditingStockId(null)
    if (isNaN(num) || num === item.quantity || num < 0) return

    setLoadingItemId(item.id)
    const res = await setVariantStockAction({
      inventoryId: item.id,
      quantity: num,
      lowStockThreshold: item.lowStockThreshold,
    })
    setLoadingItemId(null)

    if (res.success) {
      showToast(`Updated ${item.sku} stock to ${num} units.`)
      router.refresh()
    } else {
      showToast(res.error || "Failed to update stock", "error")
    }
  }

  // Quick increment/decrement
  const handleQuickAdjust = async (item: InventoryItem, delta: number) => {
    setLoadingItemId(item.id)
    const res = await quickAdjustStockAction({
      inventoryId: item.id,
      delta,
    })
    setLoadingItemId(null)

    if (res.success) {
      showToast(`Adjusted ${item.sku} by ${delta > 0 ? `+${delta}` : delta} units.`)
      router.refresh()
    } else {
      showToast(res.error || "Failed to adjust stock", "error")
    }
  }

  // Zero out stock
  const handleZeroOut = async (item: InventoryItem) => {
    if (item.quantity === 0) return
    if (!confirm(`Are you sure you want to set stock of "${item.productName}" (${item.sku}) to 0?`)) return

    setLoadingItemId(item.id)
    const res = await setVariantStockAction({
      inventoryId: item.id,
      quantity: 0,
      lowStockThreshold: item.lowStockThreshold,
    })
    setLoadingItemId(null)

    if (res.success) {
      showToast(`Stock for ${item.sku} set to 0.`)
      router.refresh()
    } else {
      showToast(res.error || "Failed to zero out stock", "error")
    }
  }

  // Delete variant
  const handleDeleteVariant = async (item: InventoryItem) => {
    if (!confirm(`Delete variant "${item.sku}"? This will permanently remove this stock record.`)) return

    setLoadingItemId(item.id)
    const res = await deleteInventoryAction(item.id)
    setLoadingItemId(null)

    if (res.success) {
      showToast(`Deleted variant ${item.sku}.`)
      setSelectedIds((prev) => prev.filter((id) => id !== item.id))
      router.refresh()
    } else {
      showToast(res.error || "Failed to delete variant", "error")
    }
  }

  // Bulk set stock
  const handleBulkSetStock = async () => {
    const num = parseInt(bulkStockVal, 10)
    if (isNaN(num) || num < 0 || selectedIds.length === 0) {
      alert("Please enter a valid non-negative number.")
      return
    }

    startTransition(async () => {
      const items = selectedIds.map((id) => ({ inventoryId: id, quantity: num }))
      const res = await bulkSetStockAction({ items })
      if (res.success) {
        showToast(`Bulk updated ${res.count} variants to ${num} units.`)
        setSelectedIds([])
        setBulkStockVal("")
        router.refresh()
      } else {
        showToast(res.error || "Bulk update failed", "error")
      }
    })
  }

  // Master Sync & Clean
  const handleSyncAndClean = async () => {
    setSyncing(true)
    try {
      const res = await syncAndCleanInventoryAction()
      if (res.success) {
        showToast("Master inventory health sync completed! All statuses aligned with real stock.")
        router.refresh()
      } else {
        showToast(("error" in res ? res.error : null) || "Sync failed", "error")
      }
    } catch (err: any) {
      showToast(err.message || "Sync failed", "error")
    } finally {
      setSyncing(false)
    }
  }

  // Checkbox toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === initialItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(initialItems.map((i) => i.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-admin-md shadow-xl text-admin-sm font-semibold flex items-center gap-2.5 transition-all animate-in slide-in-from-bottom-5 ${
            actionMessage.type === "success"
              ? "bg-emerald-950 text-emerald-100 border border-emerald-500/40"
              : "bg-rose-950 text-rose-100 border border-rose-500/40"
          }`}
        >
          <span>{actionMessage.type === "success" ? "✓" : "⚠️"}</span>
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-display-sm font-display text-admin-text-primary uppercase tracking-wide">
              Master Inventory Hub
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-admin-primary/10 text-admin-primary border border-admin-primary/20 rounded-admin-sm">
              Live Stock Truth
            </span>
          </div>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Real-time warehouse stock, variant matrix, and inventory management.
          </p>
        </div>

        {/* Sync & Health Clean Tool */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncAndClean}
            disabled={syncing}
            title="Scan database and fix any mismatched statuses or zero-stock sync issues"
            className="flex items-center gap-2 px-3.5 py-2 bg-admin-surface border border-admin-border hover:border-admin-primary text-admin-text-primary text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-all shadow-xs disabled:opacity-50"
          >
            <span className={syncing ? "animate-spin" : ""}>🔄</span>
            {syncing ? "Auditing & Syncing..." : "Sync & Health Check"}
          </button>
        </div>
      </div>

      {/* ── KPI Metrics Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => updateQuery({ status: null })}
          className={`p-4 rounded-admin-lg border transition-all cursor-pointer ${
            !currentStatus
              ? "bg-admin-surface border-admin-primary ring-1 ring-admin-primary"
              : "bg-admin-surface border-admin-border hover:border-admin-border-strong"
          }`}
        >
          <p className="text-[10px] font-bold tracking-widest uppercase text-admin-text-secondary">Tracked Variants</p>
          <p className="text-2xl font-bold text-admin-text-primary mt-1 font-mono">{stats.totalVariants}</p>
          <p className="text-[11px] text-admin-text-tertiary mt-0.5">Active SKUs</p>
        </div>

        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border">
          <p className="text-[10px] font-bold tracking-widest uppercase text-admin-text-secondary">Total Physical Stock</p>
          <p className="text-2xl font-bold text-admin-text-primary mt-1 font-mono">{stats.totalPhysicalStock.toLocaleString()}</p>
          <p className="text-[11px] text-admin-text-tertiary mt-0.5">Available across catalog</p>
        </div>

        <div
          onClick={() => updateQuery({ status: "IN_STOCK" })}
          className={`p-4 rounded-admin-lg border transition-all cursor-pointer ${
            currentStatus === "IN_STOCK"
              ? "bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500"
              : "bg-admin-surface border-admin-border hover:border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-500">In Stock</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{stats.inStockCount}</p>
          <p className="text-[11px] text-emerald-500/70 mt-0.5">Variants healthy</p>
        </div>

        <div
          onClick={() => updateQuery({ status: "LOW_STOCK" })}
          className={`p-4 rounded-admin-lg border transition-all cursor-pointer ${
            currentStatus === "LOW_STOCK"
              ? "bg-amber-950/30 border-amber-500 ring-1 ring-amber-500"
              : "bg-admin-surface border-admin-border hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-500">Low Stock</p>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">{stats.lowStockCount}</p>
          <p className="text-[11px] text-amber-500/70 mt-0.5">&le; 5 units threshold</p>
        </div>

        <div
          onClick={() => updateQuery({ status: "OUT_OF_STOCK" })}
          className={`p-4 rounded-admin-lg border transition-all cursor-pointer ${
            currentStatus === "OUT_OF_STOCK"
              ? "bg-rose-950/30 border-rose-500 ring-1 ring-rose-500"
              : "bg-admin-surface border-admin-border hover:border-rose-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-widest uppercase text-rose-500">Out of Stock</p>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-1 font-mono">{stats.outOfStockCount}</p>
          <p className="text-[11px] text-rose-500/70 mt-0.5">0 units available</p>
        </div>
      </div>

      {/* ── Search, Filters, & Sort Bar ── */}
      <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateQuery({ search: searchVal.trim() || null })
            }}
            className="flex-1 max-w-md relative"
          >
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search by SKU, Product Name, Color, or Size..."
              className="w-full pl-9 pr-4 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-primary transition-all placeholder:text-admin-text-tertiary"
            />
            <span className="absolute left-3 top-2.5 text-admin-text-tertiary text-sm">🔍</span>
            {searchVal && (
              <button
                type="button"
                onClick={() => {
                  setSearchVal("")
                  updateQuery({ search: null })
                }}
                className="absolute right-3 top-2.5 text-admin-text-tertiary hover:text-admin-text-primary text-xs"
              >
                ✕
              </button>
            )}
          </form>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Category Filter */}
            <select
              value={currentCategory}
              onChange={(e) => updateQuery({ categoryId: e.target.value || null })}
              className="px-3 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-xs font-semibold rounded-admin-md focus:outline-none focus:border-admin-primary"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={`${currentSortBy}_${currentSortOrder}`}
              onChange={(e) => {
                const [by, ord] = e.target.value.split("_")
                updateQuery({ sortBy: by, sortOrder: ord })
              }}
              className="px-3 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-xs font-semibold rounded-admin-md focus:outline-none focus:border-admin-primary"
            >
              <option value="updatedAt_desc">Recently Updated</option>
              <option value="stockQuantity_asc">Stock: Low &rarr; High</option>
              <option value="stockQuantity_desc">Stock: High &rarr; Low</option>
              <option value="productName_asc">Product Name (A-Z)</option>
              <option value="sku_asc">SKU (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-admin-border/60 pt-3 flex-wrap">
          <span className="text-[11px] font-bold text-admin-text-secondary uppercase tracking-wider mr-1">
            Status:
          </span>
          {[
            { label: "All Records", val: "" },
            { label: `In Stock (${stats.inStockCount})`, val: "IN_STOCK" },
            { label: `Low Stock (${stats.lowStockCount})`, val: "LOW_STOCK" },
            { label: `Out of Stock (${stats.outOfStockCount})`, val: "OUT_OF_STOCK" },
          ].map((tab) => {
            const active = currentStatus === tab.val
            return (
              <button
                key={tab.val}
                type="button"
                onClick={() => updateQuery({ status: tab.val || null })}
                className={`px-3 py-1 text-admin-xs font-bold rounded-full transition-all ${
                  active
                    ? "bg-admin-primary text-white shadow-xs"
                    : "bg-admin-content text-admin-text-secondary hover:text-admin-text-primary border border-admin-border"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Bulk Actions Toolbar (when items selected) ── */}
      {selectedIds.length > 0 && (
        <div className="bg-admin-primary/10 border border-admin-primary/30 p-3.5 rounded-admin-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="text-admin-sm font-bold text-admin-primary">
              {selectedIds.length} item{selectedIds.length === 1 ? "" : "s"} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-admin-xs text-admin-text-secondary hover:text-admin-text-primary underline"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                value={bulkStockVal}
                onChange={(e) => setBulkStockVal(e.target.value)}
                placeholder="Set Qty"
                className="w-24 px-2.5 py-1 text-admin-sm bg-admin-content border border-admin-border rounded-admin-md text-admin-text-primary font-bold focus:outline-none focus:border-admin-primary"
              />
              <button
                type="button"
                disabled={isPending || !bulkStockVal.trim()}
                onClick={handleBulkSetStock}
                className="px-3 py-1 bg-admin-primary text-white text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-admin-primary/90 disabled:opacity-50"
              >
                Apply to Selected
              </button>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={async () => {
                if (!confirm(`Set stock of all ${selectedIds.length} selected items to 0?`)) return
                startTransition(async () => {
                  const items = selectedIds.map((id) => ({ inventoryId: id, quantity: 0 }))
                  const res = await bulkSetStockAction({ items })
                  if (res.success) {
                    showToast(`Zeroed out ${res.count} variants.`)
                    setSelectedIds([])
                    router.refresh()
                  }
                })
              }}
              className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors"
            >
              Zero Out (0)
            </button>
          </div>
        </div>
      )}

      {/* ── Master Inventory Table ── */}
      <div className="bg-admin-surface border border-admin-border rounded-admin-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-admin-sm">
            <thead className="bg-admin-content/40 text-[10px] uppercase font-bold tracking-wider text-admin-text-secondary border-b border-admin-border select-none">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={initialItems.length > 0 && selectedIds.length === initialItems.length}
                    onChange={toggleSelectAll}
                    className="rounded border-admin-border text-admin-primary focus:ring-admin-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">Product & Variant</th>
                <th className="px-4 py-3.5">SKU</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Physical Stock</th>
                <th className="px-4 py-3.5 text-center">Reserved</th>
                <th className="px-4 py-3.5 text-center">Net Available</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-admin-border/50">
              {initialItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-admin-text-secondary">
                    <p className="text-admin-base font-semibold">No inventory records found.</p>
                    <p className="text-admin-xs mt-1 text-admin-text-tertiary">
                      Try clearing filters or running a sync.
                    </p>
                  </td>
                </tr>
              ) : (
                initialItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id)
                  const isLoading = loadingItemId === item.id
                  const availableStock = item.quantity - item.reserved
                  const isEditingThis = editingStockId === item.id

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-admin-content/40 transition-colors ${
                        isSelected ? "bg-admin-primary/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded border-admin-border text-admin-primary focus:ring-admin-primary cursor-pointer"
                        />
                      </td>

                      {/* Product & Variant */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 bg-admin-content rounded-admin-sm overflow-hidden border border-admin-border flex-shrink-0">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.productName}
                                fill
                                sizes="40px"
                                className="object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-admin-text-tertiary uppercase">
                                No Img
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${item.productId}`}
                              className="font-bold text-admin-text-primary hover:text-admin-primary transition-colors truncate block text-admin-sm"
                              title={item.productName}
                            >
                              {item.productName}
                            </Link>

                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {/* Color Swatch */}
                              {item.color && (
                                <div className="flex items-center gap-1 bg-admin-content px-2 py-0.5 rounded-admin-sm border border-admin-border text-[10px]">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                                    style={{ backgroundColor: item.colorHex || "#1A1A1A" }}
                                  />
                                  <span className="font-medium text-admin-text-primary">{item.color}</span>
                                </div>
                              )}

                              {/* Size Badge */}
                              {item.size && (
                                <span className="bg-admin-content px-2 py-0.5 rounded-admin-sm border border-admin-border text-[10px] font-bold text-admin-text-primary">
                                  Size {item.sizeAbbr || item.size}
                                </span>
                              )}

                              {/* Category */}
                              {item.categoryName && (
                                <span className="text-[10px] text-admin-text-tertiary">
                                  {item.categoryName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 font-mono text-admin-xs text-admin-text-secondary select-all">
                        {item.sku}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-admin-sm border ${
                            item.quantity <= 0
                              ? "bg-rose-950/40 text-rose-400 border-rose-500/30"
                              : item.quantity <= item.lowStockThreshold
                              ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                              : "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {item.quantity <= 0
                            ? "OUT OF STOCK"
                            : item.quantity <= item.lowStockThreshold
                            ? "LOW STOCK"
                            : "IN STOCK"}
                        </span>
                      </td>

                      {/* Physical Stock (Interactive Inline Editor) */}
                      <td className="px-4 py-3 text-center">
                        {isEditingThis ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              autoFocus
                              value={tempStockVal}
                              onChange={(e) => setTempStockVal(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveInlineStock(item)
                                if (e.key === "Escape") setEditingStockId(null)
                              }}
                              onBlur={() => handleSaveInlineStock(item)}
                              className="w-16 px-2 py-1 bg-admin-content border-2 border-admin-primary rounded-admin-sm text-admin-text-primary text-center font-bold text-admin-sm focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 group">
                            {/* Quick Decrement */}
                            <button
                              type="button"
                              disabled={isLoading || item.quantity <= 0}
                              onClick={() => handleQuickAdjust(item, -1)}
                              title="Decrease stock by 1"
                              className="w-5 h-5 flex items-center justify-center rounded bg-admin-content border border-admin-border text-admin-text-secondary hover:text-admin-text-primary hover:border-admin-border-strong opacity-0 group-hover:opacity-100 transition-all disabled:opacity-20"
                            >
                              -
                            </button>

                            {/* Click to Edit Value */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStockId(item.id)
                                setTempStockVal(item.quantity.toString())
                              }}
                              title="Click to edit stock quantity"
                              className={`px-2.5 py-1 rounded-admin-sm font-mono font-bold text-admin-sm transition-all hover:bg-admin-content hover:ring-1 hover:ring-admin-primary ${
                                item.quantity === 0
                                  ? "text-rose-500 font-extrabold"
                                  : item.quantity <= item.lowStockThreshold
                                  ? "text-amber-500"
                                  : "text-admin-text-primary"
                              }`}
                            >
                              {isLoading ? "…" : item.quantity}
                            </button>

                            {/* Quick Increment */}
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleQuickAdjust(item, 1)}
                              title="Increase stock by 1"
                              className="w-5 h-5 flex items-center justify-center rounded bg-admin-content border border-admin-border text-admin-text-secondary hover:text-admin-text-primary hover:border-admin-border-strong opacity-0 group-hover:opacity-100 transition-all"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Reserved Quantity */}
                      <td className="px-4 py-3 text-center text-admin-text-secondary font-mono text-admin-xs">
                        {item.reserved}
                      </td>

                      {/* Net Available Stock */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-mono font-bold text-admin-sm ${
                            availableStock <= 0
                              ? "text-rose-500"
                              : availableStock <= item.lowStockThreshold
                              ? "text-amber-500"
                              : "text-emerald-400"
                          }`}
                        >
                          {availableStock}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Zero */}
                          {item.quantity > 0 && (
                            <button
                              type="button"
                              onClick={() => handleZeroOut(item)}
                              title="Zero out stock"
                              className="px-2 py-1 text-[10px] font-bold bg-admin-content border border-admin-border hover:border-rose-500/40 text-admin-text-secondary hover:text-rose-400 rounded transition-colors"
                            >
                              Zero (0)
                            </button>
                          )}

                          {/* Quick +5 Restock */}
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item, 5)}
                            title="Quick restock +5 units"
                            className="px-2 py-1 text-[10px] font-bold bg-admin-content border border-admin-border hover:border-emerald-500/40 text-admin-text-secondary hover:text-emerald-400 rounded transition-colors"
                          >
                            +5
                          </button>

                          {/* Edit Product Link */}
                          <Link
                            href={`/admin/products/${item.productId}`}
                            title="Open full Product Editor"
                            className="px-2 py-1 text-[10px] font-bold bg-admin-content border border-admin-border hover:border-admin-primary text-admin-text-primary rounded transition-colors"
                          >
                            Edit
                          </Link>

                          {/* Delete Variant */}
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(item)}
                            title="Delete this variant"
                            className="px-1.5 py-1 text-[10px] font-bold text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3.5 border-t border-admin-border bg-admin-content/20 text-admin-xs text-admin-text-secondary">
            <span>
              Page <strong className="text-admin-text-primary">{currentPage}</strong> of{" "}
              <strong className="text-admin-text-primary">{totalPages}</strong> ({totalItems} total records)
            </span>

            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("page", (currentPage - 1).toString())
                    router.push(`/admin/inventory?${params.toString()}`)
                  }}
                  className="px-3 py-1 rounded bg-admin-content border border-admin-border font-bold text-admin-text-primary hover:border-admin-primary transition-colors"
                >
                  &larr; Previous
                </button>
              )}

              {currentPage < totalPages && (
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("page", (currentPage + 1).toString())
                    router.push(`/admin/inventory?${params.toString()}`)
                  }}
                  className="px-3 py-1 rounded bg-admin-content border border-admin-border font-bold text-admin-text-primary hover:border-admin-primary transition-colors"
                >
                  Next &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
