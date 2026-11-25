"use client"

import React, { useState, useTransition, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Clock,
  ShieldCheck,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Store,
  AlertCircle,
  X,
  Database,
  Image as ImageIcon,
  Tag,
  Lock,
} from "lucide-react"
import {
  syncDarazStockAction,
  cleanExpiredReservationsAction,
  releaseReservationAction,
  retryFailedSyncAction,
  getDarazProductDetailAction,
} from "@/actions/admin/daraz-stock.actions"
import type { DarazInventoryMetrics } from "@/db/queries/daraz-inventory"

function extractImageUrl(asset: any): string | null {
  if (!asset) return null
  if (typeof asset === "string") return asset
  if (typeof asset === "object") {
    return asset.secureUrl || asset.url || asset.secure_url || null
  }
  return null
}

interface DarazInventoryClientProps {
  initialItems: any[]
  totalItems: number
  totalPages: number
  currentPage: number
  metrics: DarazInventoryMetrics
  categories: { categoryId: string | null; categoryName: string | null; productCount: number }[]
  syncData: {
    lastSuccessfulSync: Date | null
    lastFailedSync: Date | null
    lastFailedDetails: string | null
    totalSuccess: number
    totalFailed: number
    recentLogs: any[]
  }
  initialReservations: any[]
  initialFailedLogs: any[]
  searchParams: {
    search?: string
    categoryId?: string
    stockStatus?: string
    darazStatus?: string
    publicationStatus?: string
    sortBy?: string
    sortOrder?: string
  }
}

export function DarazInventoryClient({
  initialItems,
  totalItems,
  totalPages,
  currentPage,
  metrics,
  categories,
  syncData,
  initialReservations,
  initialFailedLogs,
  searchParams,
}: DarazInventoryClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"inventory" | "sync" | "reservations" | "errors">("inventory")
  const [isPending, startTransition] = useTransition()

  // Local state for actions
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)

  // Product detail modal state
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // Local filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.categoryId || "all")
  const [selectedStockStatus, setSelectedStockStatus] = useState(searchParams.stockStatus || "all")
  const [selectedDarazStatus, setSelectedDarazStatus] = useState(searchParams.darazStatus || "all")
  const [selectedPubStatus, setSelectedPubStatus] = useState(searchParams.publicationStatus || "all")
  const [currentSortBy, setCurrentSortBy] = useState(searchParams.sortBy || "lastSync")
  const [currentSortOrder, setCurrentSortOrder] = useState(searchParams.sortOrder || "desc")

  // Apply filters via URL navigation
  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams()
    const merged = {
      search: searchTerm,
      categoryId: selectedCategory,
      stockStatus: selectedStockStatus,
      darazStatus: selectedDarazStatus,
      publicationStatus: selectedPubStatus,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      page: "1",
      ...updates,
    }

    Object.entries(merged).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value)
      }
    })

    startTransition(() => {
      router.push(`/admin/daraz/inventory?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters({ search: searchTerm })
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", String(page))
    startTransition(() => {
      router.push(`/admin/daraz/inventory?${params.toString()}`)
    })
  }

  // Action: Sync Daraz Stock Now
  const handleSyncStock = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncStatusMsg(null)
    try {
      const res = await syncDarazStockAction()
      if (res.success) {
        setSyncStatusMsg({
          type: "success",
          text: `Inbound sync completed: ${res.data?.totalProductsChecked || 0} products checked, ${res.data?.totalSkusUpdated || 0} SKUs updated, ${res.data?.discrepanciesFound || 0} stock changes reconciled.`,
        })
        router.refresh()
      } else {
        setSyncStatusMsg({ type: "error", text: res.error || "Sync failed" })
      }
    } catch (err: any) {
      setSyncStatusMsg({ type: "error", text: err.message || "Failed to trigger sync" })
    } finally {
      setIsSyncing(false)
    }
  }

  // Action: Clean Expired Reservations
  const handleCleanReservations = async () => {
    if (isCleaning) return
    setIsCleaning(true)
    setSyncStatusMsg(null)
    try {
      const res = await cleanExpiredReservationsAction()
      if (res.success) {
        setSyncStatusMsg({
          type: "success",
          text: `Cleaned and restored ${res.releasedCount} expired reservations back to inventory.`,
        })
        router.refresh()
      } else {
        setSyncStatusMsg({ type: "error", text: res.error || "Cleanup failed" })
      }
    } catch (err: any) {
      setSyncStatusMsg({ type: "error", text: err.message || "Failed to clean reservations" })
    } finally {
      setIsCleaning(false)
    }
  }

  // Action: Release Specific Reservation
  const handleReleaseReservation = async (id: string, sku: string) => {
    if (!confirm(`Are you sure you want to release the reservation for SKU "${sku}" back to available stock?`)) {
      return
    }
    startTransition(async () => {
      const res = await releaseReservationAction(id)
      if (res.success) {
        setSyncStatusMsg({ type: "success", text: `Reservation ${id.slice(0, 8)}... released successfully.` })
        router.refresh()
      } else {
        setSyncStatusMsg({ type: "error", text: res.error || "Failed to release reservation" })
      }
    })
  }

  // Action: Retry Failed Operation
  const handleRetryFailed = async (logId: string) => {
    startTransition(async () => {
      const res = await retryFailedSyncAction(logId)
      if (res.success) {
        setSyncStatusMsg({ type: "success", text: "Operation retried successfully and marked resolved." })
        router.refresh()
      } else {
        setSyncStatusMsg({ type: "error", text: res.error || "Retry failed" })
      }
    })
  }

  // View Product Detail Drawer
  const handleViewDetail = async (darazItemId: string) => {
    setIsLoadingDetail(true)
    try {
      const res = await getDarazProductDetailAction(darazItemId)
      if (res.success && res.data) {
        setSelectedProduct(res.data)
      } else {
        alert(res.error || "Failed to load product details")
      }
    } catch (err: any) {
      alert(err.message || "Error loading product details")
    } finally {
      setIsLoadingDetail(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-admin-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
              Daraz Inventory Hub
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
              Live Synchronized
            </span>
          </div>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Centralized control for Daraz master catalog, SKU-level stock synchronization, and reservation management.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCleanReservations}
            disabled={isCleaning || isPending}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-admin-text-secondary bg-admin-card border border-admin-border rounded-md hover:bg-admin-bg transition-colors disabled:opacity-50"
          >
            <Clock className={`w-3.5 h-3.5 ${isCleaning ? "animate-spin" : ""}`} />
            Clean Expired
          </button>
          <button
            onClick={handleSyncStock}
            disabled={isSyncing || isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Daraz Stock Now"}
          </button>
        </div>
      </div>

      {/* Global Status Alert Banner */}
      {syncStatusMsg && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg border text-sm ${
            syncStatusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{syncStatusMsg.text}</span>
          </div>
          <button
            onClick={() => setSyncStatusMsg(null)}
            className="text-admin-text-muted hover:text-admin-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-admin-card border border-admin-border rounded-xl shadow-xs">
          <span className="text-xs font-medium text-admin-text-secondary">Daraz Products</span>
          <div className="text-xl font-bold font-display text-admin-text-primary mt-1">
            {metrics.totalDarazProducts}
          </div>
          <div className="text-[11px] text-admin-text-muted mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{metrics.activeProducts} Active</span>
            <span>•</span>
            <span>{metrics.inactiveProducts} QC/Off</span>
          </div>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-xl shadow-xs">
          <span className="text-xs font-medium text-admin-text-secondary">Total SKUs</span>
          <div className="text-xl font-bold font-display text-admin-text-primary mt-1">
            {metrics.totalSkus}
          </div>
          <div className="text-[11px] text-admin-text-muted mt-1">Variations mapped</div>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-xl shadow-xs">
          <span className="text-xs font-medium text-admin-text-secondary">In Stock SKUs</span>
          <div className="text-xl font-bold font-display text-emerald-600 mt-1">
            {metrics.inStockSkus}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1">&gt; 5 units ready</div>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-xl shadow-xs">
          <span className="text-xs font-medium text-admin-text-secondary">Low / Out of Stock</span>
          <div className="text-xl font-bold font-display text-admin-text-primary mt-1">
            <span className="text-amber-600">{metrics.lowStockSkus}</span>
            <span className="text-admin-text-muted text-sm font-normal"> / </span>
            <span className="text-rose-600">{metrics.outOfStockSkus}</span>
          </div>
          <div className="text-[11px] text-admin-text-muted mt-1">Low / Sold out</div>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-xl shadow-xs">
          <span className="text-xs font-medium text-admin-text-secondary">Website Visibility</span>
          <div className="text-xl font-bold font-display text-admin-text-primary mt-1">
            <span className="text-blue-600">{metrics.publishedProducts}</span>
            <span className="text-admin-text-muted text-sm font-normal"> / </span>
            <span className="text-admin-text-muted">{metrics.unpublishedProducts}</span>
          </div>
          <div className="text-[11px] text-admin-text-muted mt-1">Live / Unpublished</div>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-xl shadow-xs">
          <span className="text-xs font-medium text-admin-text-secondary">Active Reservations</span>
          <div className="text-xl font-bold font-display text-purple-600 mt-1">
            {metrics.activeReservations}
          </div>
          <div className="text-[11px] text-admin-text-muted mt-1 flex items-center gap-1">
            <span>Checkout locks</span>
            {metrics.failedSyncOperations > 0 && (
              <span className="text-rose-600 font-semibold">• {metrics.failedSyncOperations} Errors</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-admin-border gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 relative transition-colors ${
            activeTab === "inventory"
              ? "text-admin-text-primary font-semibold border-b-2 border-orange-500"
              : "text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          Catalogue & Stock Inventory ({totalItems})
        </button>
        <button
          onClick={() => setActiveTab("sync")}
          className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
            activeTab === "sync"
              ? "text-admin-text-primary font-semibold border-b-2 border-orange-500"
              : "text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          Synchronization Control
          {syncData.totalFailed > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("reservations")}
          className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
            activeTab === "reservations"
              ? "text-admin-text-primary font-semibold border-b-2 border-orange-500"
              : "text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          Stock Reservations
          {metrics.activeReservations > 0 && (
            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
              {metrics.activeReservations}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("errors")}
          className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
            activeTab === "errors"
              ? "text-admin-text-primary font-semibold border-b-2 border-orange-500"
              : "text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          Error Monitoring
          {metrics.failedSyncOperations > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
              {metrics.failedSyncOperations}
            </span>
          )}
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: PRODUCT INVENTORY TABLE
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-4 bg-admin-card border border-admin-border rounded-xl shadow-xs space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" />
                <input
                  type="text"
                  placeholder="Search title, Daraz Item ID, or Seller SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-admin-bg border border-admin-border rounded-lg text-admin-text-primary placeholder:text-admin-text-muted focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-admin-text-primary rounded-lg hover:bg-neutral-800 transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-admin-border/50 text-xs">
              {/* Category Filter */}
              <div>
                <label className="block text-admin-text-muted mb-1 font-medium">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    applyFilters({ categoryId: e.target.value })
                  }}
                  className="w-full p-2 bg-admin-bg border border-admin-border rounded-md text-admin-text-primary text-xs"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.categoryId || c.categoryName} value={c.categoryId || c.categoryName || ""}>
                      {c.categoryName} ({c.productCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status Filter */}
              <div>
                <label className="block text-admin-text-muted mb-1 font-medium">Stock Status</label>
                <select
                  value={selectedStockStatus}
                  onChange={(e) => {
                    setSelectedStockStatus(e.target.value)
                    applyFilters({ stockStatus: e.target.value })
                  }}
                  className="w-full p-2 bg-admin-bg border border-admin-border rounded-md text-admin-text-primary text-xs"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in_stock">In Stock (&gt;5)</option>
                  <option value="low_stock">Low Stock (1-5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>

              {/* Daraz Status Filter */}
              <div>
                <label className="block text-admin-text-muted mb-1 font-medium">Daraz Status</label>
                <select
                  value={selectedDarazStatus}
                  onChange={(e) => {
                    setSelectedDarazStatus(e.target.value)
                    applyFilters({ darazStatus: e.target.value })
                  }}
                  className="w-full p-2 bg-admin-bg border border-admin-border rounded-md text-admin-text-primary text-xs"
                >
                  <option value="all">All Daraz Status</option>
                  <option value="active">Active / Live</option>
                  <option value="inactive">Inactive / Offline</option>
                  <option value="pending-qc">Pending QC</option>
                </select>
              </div>

              {/* Publication Status Filter */}
              <div>
                <label className="block text-admin-text-muted mb-1 font-medium">Website Publication</label>
                <select
                  value={selectedPubStatus}
                  onChange={(e) => {
                    setSelectedPubStatus(e.target.value)
                    applyFilters({ publicationStatus: e.target.value })
                  }}
                  className="w-full p-2 bg-admin-bg border border-admin-border rounded-md text-admin-text-primary text-xs"
                >
                  <option value="all">All Visibility</option>
                  <option value="published">Published (Storefront)</option>
                  <option value="unpublished">Unpublished (Protected)</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-admin-text-muted mb-1 font-medium">Sort By</label>
                <select
                  value={`${currentSortBy}-${currentSortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split("-")
                    setCurrentSortBy(by)
                    setCurrentSortOrder(order)
                    applyFilters({ sortBy: by, sortOrder: order })
                  }}
                  className="w-full p-2 bg-admin-bg border border-admin-border rounded-md text-admin-text-primary text-xs"
                >
                  <option value="lastSync-desc">Last Synced (Newest)</option>
                  <option value="lastSync-asc">Last Synced (Oldest)</option>
                  <option value="stock-desc">Available Stock (High-Low)</option>
                  <option value="stock-asc">Available Stock (Low-High)</option>
                  <option value="price-desc">Website Price (High-Low)</option>
                  <option value="price-asc">Website Price (Low-High)</option>
                  <option value="title-asc">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-admin-text-secondary">
                <thead className="bg-admin-bg border-b border-admin-border text-admin-text-muted uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-3">Daraz Item ID</th>
                    <th className="py-3 px-3">Seller SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Daraz Stock</th>
                    <th className="py-3 px-3 text-center">Web Stock</th>
                    <th className="py-3 px-3">Web Price</th>
                    <th className="py-3 px-3">Daraz Status</th>
                    <th className="py-3 px-3">Publication</th>
                    <th className="py-3 px-3">Media Sync</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/50">
                  {initialItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-admin-text-muted">
                        No synchronized products match your selected filters.
                      </td>
                    </tr>
                  ) : (
                    initialItems.map((item) => {
                      const primaryImg =
                        Array.isArray(item.cloudinaryImages) && item.cloudinaryImages.length > 0
                          ? extractImageUrl(item.cloudinaryImages[0])
                          : null

                      const isOutOfStock = item.websiteAvailableStock <= 0
                      const isLowStock = item.websiteAvailableStock > 0 && item.websiteAvailableStock <= 5

                      return (
                        <tr key={item.id} className="hover:bg-admin-bg/50 transition-colors">
                          {/* Image & Title */}
                          <td className="py-3 px-4 max-w-[240px]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 relative">
                                {primaryImg ? (
                                  <Image
                                    src={primaryImg}
                                    alt={item.title}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span
                                  className="font-medium text-admin-text-primary line-clamp-1 block cursor-pointer hover:text-orange-600 transition-colors"
                                  title={item.title}
                                  onClick={() => handleViewDetail(item.darazItemId)}
                                >
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-admin-text-muted font-mono block">
                                  SKU ID: {item.skuId}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Daraz Item ID */}
                          <td className="py-3 px-3 font-mono text-[11px] text-admin-text-primary">
                            {item.darazItemId}
                          </td>

                          {/* Seller SKU */}
                          <td className="py-3 px-3 font-mono text-[11px] text-admin-text-primary max-w-[130px] truncate" title={item.sellerSku}>
                            {item.sellerSku}
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 text-admin-text-secondary max-w-[120px] truncate" title={item.categoryName}>
                            {item.categoryName || "—"}
                          </td>

                          {/* Daraz Stock */}
                          <td className="py-3 px-3 text-center font-semibold text-admin-text-primary">
                            {item.darazStock}
                          </td>

                          {/* Website Available Stock */}
                          <td className="py-3 px-3 text-center font-bold">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                isOutOfStock
                                  ? "bg-rose-100 text-rose-700"
                                  : isLowStock
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {item.websiteAvailableStock}
                            </span>
                          </td>

                          {/* Website Price */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-admin-text-primary">
                              NPR {Number(item.websiteCalculatedPrice).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-admin-text-muted line-through">
                              NPR {Number(item.effectiveDarazPrice).toLocaleString()}
                            </div>
                          </td>

                          {/* Daraz Product Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                item.productStatus.toLowerCase() === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                              }`}
                            >
                              {item.productStatus}
                            </span>
                          </td>

                          {/* Publication Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                item.isPublishedOnWebsite
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                              }`}
                            >
                              {item.isPublishedOnWebsite ? "Published" : "Draft"}
                            </span>
                          </td>

                          {/* Media Sync */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                item.mediaSyncStatus === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : item.mediaSyncStatus === "FAILED"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {item.mediaSyncStatus}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleViewDetail(item.darazItemId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-admin-text-secondary bg-admin-card border border-admin-border rounded-md hover:bg-admin-bg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Details
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-admin-border text-xs text-admin-text-secondary">
                <span>
                  Showing page <strong className="text-admin-text-primary">{currentPage}</strong> of{" "}
                  <strong className="text-admin-text-primary">{totalPages}</strong> ({totalItems} total variations)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isPending}
                    className="p-1.5 border border-admin-border rounded-md hover:bg-admin-bg disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isPending}
                        className={`w-7 h-7 rounded-md font-medium ${
                          currentPage === pageNum
                            ? "bg-admin-text-primary text-white"
                            : "hover:bg-admin-bg text-admin-text-secondary"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isPending}
                    className="p-1.5 border border-admin-border rounded-md hover:bg-admin-bg disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: SYNCHRONIZATION CONTROL PANEL
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "sync" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-admin-card border border-admin-border rounded-xl">
              <span className="text-xs text-admin-text-muted">Last Successful Inbound Sync</span>
              <div className="text-sm font-semibold text-admin-text-primary mt-1">
                {syncData.lastSuccessfulSync
                  ? new Date(syncData.lastSuccessfulSync).toLocaleString()
                  : "Never"}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">✓ Status healthy</div>
            </div>

            <div className="p-4 bg-admin-card border border-admin-border rounded-xl">
              <span className="text-xs text-admin-text-muted">Last Failed Operation</span>
              <div className="text-sm font-semibold text-admin-text-primary mt-1">
                {syncData.lastFailedSync
                  ? new Date(syncData.lastFailedSync).toLocaleString()
                  : "None"}
              </div>
              <div className="text-[11px] text-rose-600 font-medium mt-1 truncate">
                {syncData.lastFailedDetails || "0 persistent errors"}
              </div>
            </div>

            <div className="p-4 bg-admin-card border border-admin-border rounded-xl">
              <span className="text-xs text-admin-text-muted">Next Scheduled Sync</span>
              <div className="text-sm font-semibold text-admin-text-primary mt-1">
                Automatic Every 15-30 Min
              </div>
              <div className="text-[11px] text-admin-text-muted mt-1">Via Vercel Cron Endpoint</div>
            </div>

            <div className="p-4 bg-admin-card border border-admin-border rounded-xl">
              <span className="text-xs text-admin-text-muted">Total Sync Operations</span>
              <div className="text-sm font-semibold text-admin-text-primary mt-1">
                {syncData.totalSuccess} Success / {syncData.totalFailed} Failed
              </div>
              <div className="text-[11px] text-admin-text-muted mt-1">Logged in Daraz Sync Audit</div>
            </div>
          </div>

          {/* Sync History Audit Log */}
          <div className="bg-admin-card border border-admin-border rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-admin-border">
              <h2 className="text-sm font-bold text-admin-text-primary">Recent Synchronization Audit History</h2>
              <p className="text-xs text-admin-text-muted mt-0.5">
                Verifiable record of inbound catalog pulls, stock pushes, and reservation lifecycle transitions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-admin-text-secondary">
                <thead className="bg-admin-bg border-b border-admin-border text-admin-text-muted uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-3">Sync Type</th>
                    <th className="py-2.5 px-3">Item / SKU</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/50">
                  {syncData.recentLogs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="py-2.5 px-4 whitespace-nowrap text-admin-text-muted">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-admin-text-primary">
                        {log.syncType}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {log.darazItemId ? `${log.darazItemId}` : "All"}
                        {log.sellerSku ? ` / ${log.sellerSku}` : ""}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700"
                              : log.status === "RESOLVED"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-[350px] truncate" title={log.details}>
                        {log.details || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: STOCK RESERVATIONS MANAGEMENT
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "reservations" && (
        <div className="space-y-4">
          <div className="p-4 bg-admin-card border border-admin-border rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-admin-text-primary">Active & Recent Stock Reservations</h2>
              <p className="text-xs text-admin-text-muted mt-0.5">
                Atomic reservation locks held during customer checkout sessions. Locks automatically expire after 15 minutes.
              </p>
            </div>
            <button
              onClick={handleCleanReservations}
              disabled={isCleaning}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              Release Expired Reservations Now
            </button>
          </div>

          <div className="bg-admin-card border border-admin-border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-admin-text-secondary">
                <thead className="bg-admin-bg border-b border-admin-border text-admin-text-muted uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Reservation ID</th>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Seller SKU</th>
                    <th className="py-2.5 px-3 text-center">Reserved Qty</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Created</th>
                    <th className="py-2.5 px-3">Expires At</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/50">
                  {initialReservations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-admin-text-muted">
                        No active or recent stock reservations found.
                      </td>
                    </tr>
                  ) : (
                    initialReservations.map((res: any) => {
                      const isExpired = new Date(res.expiresAt) < new Date()
                      const isHeld = res.status === "HELD"

                      return (
                        <tr key={res.id}>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-admin-text-muted">
                            {res.id.slice(0, 8)}...
                          </td>
                          <td className="py-2.5 px-3 font-mono text-admin-text-primary">
                            {res.orderId || "Checkout Session"}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium text-admin-text-primary">
                            {res.sellerSku}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-purple-700">
                            {res.reservedQuantity}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                res.status === "HELD"
                                  ? isExpired
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-purple-100 text-purple-800"
                                  : res.status === "DEDUCTED_ON_DARAZ"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {res.status} {isExpired && isHeld ? "(EXPIRED)" : ""}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-admin-text-muted">
                            {new Date(res.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 px-3 text-admin-text-muted">
                            {new Date(res.expiresAt).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isHeld && (
                              <button
                                onClick={() => handleReleaseReservation(res.id, res.sellerSku)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Release Lock
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: ERROR MONITORING & RETRY MANAGEMENT
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "errors" && (
        <div className="space-y-4">
          <div className="p-4 bg-admin-card border border-admin-border rounded-xl shadow-xs">
            <h2 className="text-sm font-bold text-admin-text-primary">Failed Synchronization Operations</h2>
            <p className="text-xs text-admin-text-muted mt-0.5">
              Persistent log of API timeouts, validation rejects, or network delays. Retries are strictly idempotent and guarantee zero double deductions.
            </p>
          </div>

          <div className="bg-admin-card border border-admin-border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-admin-text-secondary">
                <thead className="bg-admin-bg border-b border-admin-border text-admin-text-muted uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-3">Operation</th>
                    <th className="py-2.5 px-3">Item / SKU</th>
                    <th className="py-2.5 px-3">Error Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Retry Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/50">
                  {initialFailedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-emerald-700">
                        <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                        Zero failed synchronization operations. All systems running cleanly.
                      </td>
                    </tr>
                  ) : (
                    initialFailedLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="py-2.5 px-4 text-admin-text-muted whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-admin-text-primary">
                          {log.syncType}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {log.darazItemId ? `${log.darazItemId}` : "Batch"}
                          {log.sellerSku ? ` / ${log.sellerSku}` : ""}
                        </td>
                        <td className="py-2.5 px-3 text-rose-700 max-w-[300px] truncate" title={log.details}>
                          {log.details || "API timeout or rejection"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRetryFailed(log.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Retry
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          PRODUCT DETAIL SLIDE-OVER MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-admin-card border border-admin-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-admin-border flex items-center justify-between bg-admin-bg">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-admin-text-primary line-clamp-1">
                    {selectedProduct.item.title}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedProduct.item.isPublishedOnWebsite
                        ? "bg-blue-100 text-blue-800"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {selectedProduct.item.isPublishedOnWebsite ? "Published" : "Unpublished"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-admin-text-muted mt-1 font-mono">
                  <span>Daraz Item ID: {selectedProduct.item.darazItemId}</span>
                  <span>•</span>
                  <span>Category: {selectedProduct.item.categoryName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-md text-admin-text-muted hover:text-admin-text-primary hover:bg-admin-card transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Cloudinary Image Gallery */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-muted mb-2">
                  Cloudinary Media Assets (0 Raw Daraz CDN URLs)
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {Array.isArray(selectedProduct.item.cloudinaryImages) &&
                  selectedProduct.item.cloudinaryImages.length > 0 ? (
                    selectedProduct.item.cloudinaryImages.map((asset: any, idx: number) => {
                      const imgUrl = extractImageUrl(asset)
                      if (!imgUrl) return null
                      return (
                        <div
                          key={idx}
                          className="w-18 h-18 rounded-lg overflow-hidden border border-admin-border shrink-0 relative bg-neutral-100"
                        >
                          <Image
                            src={imgUrl}
                            alt={`Asset ${idx + 1}`}
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-xs text-admin-text-muted italic">No media assets found.</div>
                  )}
                </div>
              </div>

              {/* Sibling Variations Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-muted mb-2">
                  SKU Variations ({selectedProduct.skus.length})
                </h3>
                <div className="border border-admin-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-admin-bg border-b border-admin-border text-[10px] text-admin-text-muted uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Seller SKU</th>
                        <th className="py-2 px-3">SKU ID</th>
                        <th className="py-2 px-2 text-center">Daraz Stock</th>
                        <th className="py-2 px-2 text-center">Web Stock</th>
                        <th className="py-2 px-3">Daraz Price</th>
                        <th className="py-2 px-3">Web Price (-15%)</th>
                        <th className="py-2 px-3">Media Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-border/50">
                      {selectedProduct.skus.map((sku: any) => (
                        <tr key={sku.id}>
                          <td className="py-2 px-3 font-mono font-medium text-admin-text-primary">
                            {sku.sellerSku}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-admin-text-muted">
                            {sku.skuId}
                          </td>
                          <td className="py-2 px-2 text-center font-semibold text-admin-text-primary">
                            {sku.darazStock}
                          </td>
                          <td className="py-2 px-2 text-center font-bold">
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                                sku.websiteAvailableStock <= 0
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {sku.websiteAvailableStock}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="line-through text-admin-text-muted">
                              NPR {Number(sku.darazOriginalPrice).toLocaleString()}
                            </span>
                            <span className="font-semibold text-admin-text-primary block">
                              NPR {Number(sku.effectiveDarazPrice).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-orange-600">
                            NPR {Number(sku.websiteCalculatedPrice).toLocaleString()}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {sku.mediaSyncStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sync History for this product */}
              {selectedProduct.recentLogs && selectedProduct.recentLogs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-muted mb-2">
                    Recent Item Sync History
                  </h3>
                  <div className="border border-admin-border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-admin-bg border-b border-admin-border text-[10px] text-admin-text-muted uppercase">
                        <tr>
                          <th className="py-1.5 px-3">Time</th>
                          <th className="py-1.5 px-3">Type</th>
                          <th className="py-1.5 px-3">Status</th>
                          <th className="py-1.5 px-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-admin-border/50">
                        {selectedProduct.recentLogs.map((log: any) => (
                          <tr key={log.id}>
                            <td className="py-1.5 px-3 text-admin-text-muted whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </td>
                            <td className="py-1.5 px-3 font-mono font-medium">{log.syncType}</td>
                            <td className="py-1.5 px-3">
                              <span className="font-bold text-[10px] text-emerald-700">{log.status}</span>
                            </td>
                            <td className="py-1.5 px-3 truncate max-w-[200px]" title={log.details}>
                              {log.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-admin-border bg-admin-bg flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-admin-text-secondary bg-admin-card border border-admin-border rounded-lg hover:bg-neutral-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
