"use client"

import React, { useState, useTransition } from "react"
import {
  TrendingUp,
  Building2,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Download,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react"
import type { DarazIncomeSummary, DarazSoldItem } from "@/services/daraz-finance.service"
import { syncDarazFinanceAction } from "@/actions/admin/daraz-finance.actions"

interface DarazFinanceClientProps {
  initialData: DarazIncomeSummary
}

export function DarazFinanceClient({ initialData }: DarazFinanceClientProps) {
  const [data, setData] = useState<DarazIncomeSummary>(initialData)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTab, setFilterTab] = useState<"all" | "received" | "on_delivery" | "returned">("all")
  const [isPending, startTransition] = useTransition()
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const handleSync = () => {
    startTransition(async () => {
      const res = await syncDarazFinanceAction()
      if (res.success) {
        setSyncMessage(res.message)
        setTimeout(() => setSyncMessage(null), 4000)
      }
    })
  }

  // Filter items
  const filteredItems = data.soldItems.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderId.includes(searchQuery.trim())

    if (!matchesSearch) return false

    if (filterTab === "received") return item.isReceived
    if (filterTab === "on_delivery") return item.isInDelivery
    if (filterTab === "returned") return item.isReturnedOrCanceled

    return true
  })

  const exportCsv = () => {
    const headers = [
      "Order ID",
      "Date",
      "Product Name",
      "SKU",
      "Variation",
      "Selling Price Listed (NPR)",
      "Sold At Price (NPR)",
      "Money Received in Bank (NPR)",
      "Predicted Upcoming Payout (NPR)",
      "Status",
    ]
    const rows = filteredItems.map((item) => [
      item.orderId,
      item.date,
      `"${item.name.replace(/"/g, '""')}"`,
      item.sku,
      `"${item.variation.replace(/"/g, '""')}"`,
      item.sellingPrice,
      item.soldPrice,
      item.receivedAmount,
      item.predictedAmount,
      item.statusLabel,
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `xinvora_daraz_income_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-admin-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
              Daraz Income & Sold Products
            </h1>
            {data.isLiveData ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live: {data.account}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                Modeled Preview
              </span>
            )}
          </div>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Track every sold item from newest to oldest: the price you listed, what price it was sold at, and the exact money you received or will receive in your bank.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSync}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-admin-md bg-admin-primary text-white hover:bg-admin-primary-hover text-admin-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span>{isPending ? "Syncing..." : "Sync From Daraz"}</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-admin-md bg-admin-content hover:bg-admin-content-hover border border-admin-border text-admin-xs font-semibold text-admin-text-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-admin-text-secondary" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-green-950/30 border border-green-500/40 rounded-admin-md text-green-400 text-admin-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* ── Income Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money Received in Bank */}
        <div className="p-4 rounded-admin-lg bg-gradient-to-br from-admin-surface to-admin-surface/70 border border-green-500/30 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-400">Total Money Received</span>
            <Building2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-admin-2xl font-mono font-bold text-admin-text-primary">
              NPR {data.totalReceivedInBank.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>{data.deliveredItemsCount} Delivered Items</span>
            <span className="text-green-400 font-semibold">Cleared to Bank</span>
          </div>
        </div>

        {/* Expected/Predicted Payout on Delivery */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Predicted Delivery Payout
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-admin-2xl font-mono font-bold text-amber-300">
              NPR {data.predictedUpcomingIncome.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>{data.inTransitItemsCount} Items On Delivery / Transit</span>
            <span className="text-amber-400 font-semibold">Expected Soon</span>
          </div>
        </div>

        {/* Gross Sold Volume */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sold Volume</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-admin-2xl font-mono font-bold text-admin-text-primary">
              NPR {data.totalSoldVolume.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Total Units Sold: {data.totalSoldItemsCount}</span>
            <span className="text-blue-400 font-semibold">Gross Volume</span>
          </div>
        </div>

        {/* Realization Rate */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Take-Home Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-admin-2xl font-mono font-bold text-purple-300">
              {data.averageRealizationRate}%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Net Received ÷ Sold Price</span>
            <span className="text-purple-400 font-semibold">Statement Yield</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar & Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-admin-surface border border-admin-border rounded-admin-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-admin-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, or order #..."
            className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-9 pr-3 py-1.5 text-admin-xs text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center bg-admin-content border border-admin-border rounded-admin-md p-0.5 text-admin-xs overflow-x-auto">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
              filterTab === "all"
                ? "bg-admin-surface text-admin-text-primary font-bold shadow-xs"
                : "text-admin-text-secondary hover:text-admin-text-primary"
            }`}
          >
            All Items ({data.soldItems.length})
          </button>
          <button
            onClick={() => setFilterTab("received")}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
              filterTab === "received"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "text-admin-text-secondary hover:text-admin-text-primary"
            }`}
          >
            Money Received ({data.deliveredItemsCount})
          </button>
          <button
            onClick={() => setFilterTab("on_delivery")}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
              filterTab === "on_delivery"
                ? "bg-amber-600 text-white font-bold shadow-xs"
                : "text-admin-text-secondary hover:text-admin-text-primary"
            }`}
          >
            On Delivery ({data.inTransitItemsCount})
          </button>
          <button
            onClick={() => setFilterTab("returned")}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
              filterTab === "returned"
                ? "bg-rose-600 text-white font-bold shadow-xs"
                : "text-admin-text-secondary hover:text-admin-text-primary"
            }`}
          >
            Returned / Canceled
          </button>
        </div>
      </div>

      {/* ── Clean Income Sold Items Table ── */}
      <div className="border border-admin-border rounded-admin-lg overflow-hidden bg-admin-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-admin-xs border-collapse">
            <thead>
              <tr className="bg-admin-content/90 border-b border-admin-border text-admin-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-16">Image</th>
                <th className="py-3.5 px-4">Product Name & SKU</th>
                <th className="py-3.5 px-4">Order & Date</th>
                <th className="py-3.5 px-4 text-right">Selling Price You Put</th>
                <th className="py-3.5 px-4 text-right">Price Sold At</th>
                <th className="py-3.5 px-4 text-right font-bold text-admin-text-primary">
                  Money You Receive
                </th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border/60 text-admin-xs">
              {filteredItems.map((item) => (
                <tr key={item.orderItemId} className="hover:bg-admin-content/40 transition-colors">
                  {/* Thumbnail Image */}
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-admin-md overflow-hidden bg-neutral-900 border border-admin-border flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-admin-text-secondary/50" />
                      )}
                    </div>
                  </td>

                  {/* Product Name & SKU */}
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-semibold text-admin-text-primary line-clamp-2 leading-snug">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-admin-text-secondary font-mono flex items-center gap-2 mt-1">
                      <span>SKU: {item.sku}</span>
                      {item.variation && (
                        <>
                          <span>•</span>
                          <span className="text-admin-text-primary/80">{item.variation}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Order ID & Date */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="text-blue-400 font-bold">#{item.orderId}</div>
                    <div className="text-admin-text-secondary mt-0.5">{item.date}</div>
                  </td>

                  {/* Selling Price You Put (Listing) */}
                  <td className="py-3 px-4 text-right font-mono text-admin-text-secondary">
                    NPR {item.sellingPrice.toLocaleString()}
                  </td>

                  {/* Price It Was Sold At */}
                  <td className="py-3 px-4 text-right font-mono font-semibold text-admin-text-primary">
                    NPR {item.soldPrice.toLocaleString()}
                    {item.sellingPrice !== item.soldPrice && (
                      <div className="text-[10px] text-amber-400 font-normal">
                        (-{item.sellingPrice - item.soldPrice} voucher)
                      </div>
                    )}
                  </td>

                  {/* How Much You Receive */}
                  <td className="py-3 px-4 text-right font-mono">
                    {item.isReceived ? (
                      <div>
                        <div className="font-bold text-emerald-400 text-admin-sm">
                          NPR {item.receivedAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-500/80 font-sans font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Received in Bank
                        </div>
                      </div>
                    ) : item.isInDelivery ? (
                      <div>
                        <div className="font-bold text-amber-300 text-admin-sm">
                          ~ NPR {item.predictedAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-amber-400 font-sans font-medium flex items-center justify-end gap-1">
                          <Sparkles className="w-3 h-3" /> Predicted Payout
                        </div>
                      </div>
                    ) : (
                      <div className="text-admin-text-secondary text-[11px]">
                        —
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-right">
                    {item.isReceived ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/25">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    ) : item.isInDelivery ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                        <Clock className="w-3 h-3" /> On Delivery
                      </span>
                    ) : item.status === "returned" || item.status === "shipped_back_success" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                        <RotateCcw className="w-3 h-3" /> Returned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-500/15 text-neutral-400 border border-neutral-500/25">
                        {item.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
