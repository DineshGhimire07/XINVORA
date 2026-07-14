"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import QRCode from "react-qr-code"
import {
  Search,
  Printer,
  Download,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash
} from "lucide-react"
import { updateInvoiceNotesAction, markInvoiceAsPrintedAction } from "@/actions/admin/invoices.actions"
import { assignInvoiceNumberAction } from "@/actions/admin/orders.actions"
import { toast } from "sonner"

interface PrintInvoicesClientProps {
  invoiceData: {
    items: any[]
    total: number
    totalPages: number
    currentPage: number
  }
  currentStatusTab: string
  currentSearch: string
  currentStartDate: string
  currentEndDate: string
  stats: {
    totalInvoices: number
    printedInvoices: number
    pendingInvoices: number
    totalAmount: number
    avgValue: number
  }
}

const TABS = [
  { label: "All Invoices", id: "all", key: "totalInvoices" },
  { label: "Printed", id: "printed", key: "printedInvoices" },
  { label: "Pending", id: "pending", key: "pendingInvoices" },
  { label: "Void", id: "void", count: 0 },
  { label: "Refunded", id: "refunded", count: 0 }
]

export function PrintInvoicesClient({
  invoiceData,
  currentStatusTab,
  currentSearch,
  currentStartDate,
  currentEndDate,
  stats
}: PrintInvoicesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Search & Filters state
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [startDate, setStartDate] = useState(currentStartDate)
  const [endDate, setEndDate] = useState(currentEndDate)
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Preview panel state
  const [activeInvoice, setActiveInvoice] = useState<any>(invoiceData.items[0] || null)
  const [invoiceNotes, setInvoiceNotes] = useState(activeInvoice?.notes || "")
  
  const [isPending, startTransition] = useTransition()
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  // Trigger search URL update
  const applyFilters = (newStatus?: string, searchVal?: string, start?: string, end?: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", "1")
      
      const tab = newStatus !== undefined ? newStatus : currentStatusTab
      if (tab && tab !== "all") params.set("status", tab)
      else params.delete("status")

      const term = searchVal !== undefined ? searchVal : searchInput
      if (term) params.set("search", term)
      else params.delete("search")

      const sDate = start !== undefined ? start : startDate
      if (sDate) params.set("startDate", sDate)
      else params.delete("startDate")

      const eDate = end !== undefined ? end : endDate
      if (eDate) params.set("endDate", eDate)
      else params.delete("endDate")

      router.push(`/admin/orders/print?${params.toString()}`)
    })
  }

  // Row selection helpers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(invoiceData.items.map((item) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation()
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  // Save invoice notes mutation
  const handleSaveNotes = async () => {
    if (!activeInvoice) return
    setIsSavingNotes(true)
    const res = await updateInvoiceNotesAction(activeInvoice.id, invoiceNotes)
    setIsSavingNotes(false)
    if (res.success) {
      toast.success("Invoice notes updated successfully!")
      // Update local state
      setActiveInvoice((prev: any) => ({ ...prev, notes: invoiceNotes }))
    } else {
      toast.error(res.error?.message || "Failed to update notes.")
    }
  }

  // Single invoice print handler
  const handlePrintSingle = async (invoice: any) => {
    // Open standard window print in new tab or trigger bulk print for this single ID
    window.open(`/admin/orders/print/bulk?ids=${invoice.id}`, "_blank")
    // Optimistically mark as printed locally
    await markInvoiceAsPrintedAction(invoice.id)
    toast.success(`Sent Invoice ${invoice.invoiceNumber || invoice.orderNumber} to printer.`)
  }

  const handleBulkPrint = () => {
    if (selectedIds.length === 0) return
    window.open(`/admin/orders/print/bulk?ids=${selectedIds.join(",")}`, "_blank")
    setSelectedIds([])
  }

  // Determine status display value
  const getInvoiceStatus = (item: any) => {
    if (["CANCELLED", "FAILED"].includes(item.status)) return "Void"
    if (item.status === "REFUNDED") return "Refunded"
    return item.invoicePrintedAt ? "Printed" : "Pending"
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      
      {/* LEFT CONTENT SECTION */}
      <div className="flex-1 w-full space-y-6">
        
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1: Total Invoices */}
          <div className="bg-admin-surface border border-admin-border p-4 rounded-admin-lg flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Total Invoices</span>
              <h3 className="text-xl font-bold font-mono text-admin-text-primary mt-1">{stats.totalInvoices.toLocaleString()}</h3>
              <p className="text-[9px] text-emerald-600 mt-1 font-semibold">↑ 14.8% vs last week</p>
            </div>
            <div className="h-9 w-9 bg-admin-content border border-admin-border rounded-admin-md flex items-center justify-center text-admin-text-secondary">
              <FileText className="h-4.5 w-4.5 text-sky-500" />
            </div>
          </div>

          {/* Card 2: Printed Invoices */}
          <div className="bg-admin-surface border border-admin-border p-4 rounded-admin-lg flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Printed Invoices</span>
              <h3 className="text-xl font-bold font-mono text-admin-text-primary mt-1">{stats.printedInvoices.toLocaleString()}</h3>
              <p className="text-[9px] text-emerald-600 mt-1 font-semibold">↑ 17.3% vs last week</p>
            </div>
            <div className="h-9 w-9 bg-admin-content border border-admin-border rounded-admin-md flex items-center justify-center text-admin-text-secondary">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
            </div>
          </div>

          {/* Card 3: Pending Invoices */}
          <div className="bg-admin-surface border border-admin-border p-4 rounded-admin-lg flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Pending Invoices</span>
              <h3 className="text-xl font-bold font-mono text-admin-text-primary mt-1">{stats.pendingInvoices.toLocaleString()}</h3>
              <p className="text-[9px] text-rose-600 mt-1 font-semibold">↓ 6.2% vs last week</p>
            </div>
            <div className="h-9 w-9 bg-admin-content border border-admin-border rounded-admin-md flex items-center justify-center text-admin-text-secondary">
              <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
            </div>
          </div>

          {/* Card 4: Total Invoice Amount */}
          <div className="bg-admin-surface border border-admin-border p-4 rounded-admin-lg flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Total Invoice Amount</span>
              <h3 className="text-xl font-bold font-mono text-admin-text-primary mt-1">{formatCurrency(stats.totalAmount * 100)}</h3>
              <p className="text-[9px] text-emerald-600 mt-1 font-semibold">↑ 19.6% vs last week</p>
            </div>
          </div>

          {/* Card 5: Avg. Invoice Value */}
          <div className="bg-admin-surface border border-admin-border p-4 rounded-admin-lg flex items-center justify-between shadow-xs col-span-2 md:col-span-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Avg. Invoice Value</span>
              <h3 className="text-xl font-bold font-mono text-admin-text-primary mt-1">{formatCurrency(stats.avgValue * 100)}</h3>
              <p className="text-[9px] text-emerald-600 mt-1 font-semibold">↑ 8.7% vs last week</p>
            </div>
          </div>
        </div>

        {/* TABS & FILTER BAR CONTAINER */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg shadow-xs overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-admin-border p-4 gap-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {TABS.map((tab) => {
                const count = tab.key ? (stats as any)[tab.key] : (tab.count || 0)
                const isActive = currentStatusTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => applyFilters(tab.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-admin-md border whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-admin-primary text-admin-primary-on border-admin-primary"
                        : "bg-admin-content text-admin-text-secondary border-admin-border hover:bg-admin-content-hover/40"
                    )}
                  >
                    {tab.label}{" "}
                    <span className={cn(
                      "ml-1 font-mono text-[10px] px-1 rounded-sm",
                      isActive ? "bg-white/20 text-white" : "bg-admin-content-hover text-admin-text-secondary"
                    )}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Date Filters & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date pickers */}
              <div className="flex items-center gap-2 border border-admin-border bg-admin-content rounded-admin-md px-2.5 py-1 text-admin-xs text-admin-text-secondary">
                <Calendar className="h-3.5 w-3.5" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    applyFilters(undefined, undefined, e.target.value, undefined)
                  }}
                  className="bg-transparent focus:outline-none focus:ring-0 w-24 text-[10px]"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    applyFilters(undefined, undefined, undefined, e.target.value)
                  }}
                  className="bg-transparent focus:outline-none focus:ring-0 w-24 text-[10px]"
                />
              </div>

              {/* Text Search */}
              <div className="relative w-full sm:w-48 md:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-text-secondary" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  placeholder="Search invoices..."
                  className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-9 pr-4 py-1 text-xs text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
                />
              </div>
            </div>
          </div>

          {/* BULK SELECTION ACTION TOOLBAR */}
          {selectedIds.length > 0 && (
            <div className="bg-sky-50 border-b border-sky-100 px-4 py-2.5 flex items-center justify-between text-xs text-sky-800 animate-in fade-in slide-in-from-top-1 duration-150">
              <span className="font-semibold">
                {selectedIds.length} invoice(s) selected for printing
              </span>
              <button
                onClick={handleBulkPrint}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1 rounded shadow-sm text-[11px] flex items-center gap-1 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" /> Bulk Print ({selectedIds.length})
              </button>
            </div>
          )}

          {/* TABLE LISTING */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-admin-border bg-admin-content/25 text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        invoiceData.items.length > 0 &&
                        selectedIds.length === invoiceData.items.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-admin-border text-admin-primary focus:ring-admin-primary"
                    />
                  </th>
                  <th className="py-3 px-4">Invoice No.</th>
                  <th className="py-3 px-4">Order No.</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50 text-admin-xs">
                {invoiceData.items.length > 0 ? (
                  invoiceData.items.map((item) => {
                    const isSelected = selectedIds.includes(item.id)
                    const isActive = activeInvoice?.id === item.id
                    const address = item.shippingAddress || {}
                    
                    return (
                      <tr
                        key={item.id}
                        onClick={() => {
                          setActiveInvoice(item)
                          setInvoiceNotes(item.notes || "")
                        }}
                        className={cn(
                          "hover:bg-admin-content-hover/20 cursor-pointer transition-colors",
                          isActive && "bg-admin-content-hover/30"
                        )}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(e, item.id)}
                            className="rounded border-admin-border text-admin-primary focus:ring-admin-primary"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-admin-text-primary">
                          {item.invoiceNumber || "N/A"}
                        </td>
                        <td className="py-3 px-4 font-mono text-admin-text-secondary">
                          {item.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-admin-text-primary">
                            {address.fullName || item.user?.firstName + " " + item.user?.lastName}
                          </div>
                          <div className="text-[10px] text-admin-text-secondary">
                            {address.municipality || "N/A"}, {address.district || "N/A"}
                          </div>
                          <div className="text-[10px] text-admin-text-secondary lowercase">
                            {item.user?.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-admin-text-secondary">
                          <div>{new Date(item.createdAt).toLocaleDateString("en-GB")}</div>
                          <div className="text-[10px]">
                            {new Date(item.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-admin-text-primary">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide border",
                              getInvoiceStatus(item) === "Printed" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                              getInvoiceStatus(item) === "Pending" && "bg-amber-50 text-amber-700 border-amber-100",
                              getInvoiceStatus(item) === "Void" && "bg-slate-50 text-slate-700 border-slate-100",
                              getInvoiceStatus(item) === "Refunded" && "bg-rose-50 text-rose-700 border-rose-100"
                            )}
                          >
                            {getInvoiceStatus(item)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-admin-text-secondary">
                          {item.invoicePrintedAt ? (
                            <>
                              <div>{new Date(item.invoicePrintedAt).toLocaleDateString("en-GB")}</div>
                              <div className="text-[10px]">
                                {new Date(item.invoicePrintedAt).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true
                                })}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePrintSingle(item)}
                              title="Print Invoice"
                              className="p-1 rounded hover:bg-admin-content-hover text-admin-text-secondary hover:text-admin-text-primary transition-colors"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-admin-sm text-admin-text-secondary italic">
                      No invoices found matching current criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION PANEL */}
          {invoiceData.totalPages > 1 && (
            <div className="border-t border-admin-border p-4 flex items-center justify-between text-xs text-admin-text-secondary">
              <span>
                Showing page <strong>{invoiceData.currentPage}</strong> of <strong>{invoiceData.totalPages}</strong> ({invoiceData.total} items)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={invoiceData.currentPage === 1 || isPending}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("page", String(invoiceData.currentPage - 1))
                    router.push(`/admin/orders/print?${params.toString()}`)
                  }}
                  className="p-1 border border-admin-border rounded bg-admin-content hover:bg-admin-content-hover/40 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={invoiceData.currentPage === invoiceData.totalPages || isPending}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("page", String(invoiceData.currentPage + 1))
                    router.push(`/admin/orders/print?${params.toString()}`)
                  }}
                  className="p-1 border border-admin-border rounded bg-admin-content hover:bg-admin-content-hover/40 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR PREVIEW PANEL */}
      <div className="w-full lg:w-96 bg-admin-surface border border-admin-border rounded-admin-lg shadow-xs p-5 space-y-6 lg:sticky lg:top-6">
        
        {/* Preview Panel Header */}
        <div className="flex items-center justify-between border-b border-admin-border pb-3">
          <h3 className="font-bold text-admin-base text-admin-text-primary">
            Invoice Preview
          </h3>
          {activeInvoice && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border",
                getInvoiceStatus(activeInvoice) === "Printed" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                getInvoiceStatus(activeInvoice) === "Pending" && "bg-amber-50 text-amber-700 border-amber-100",
                getInvoiceStatus(activeInvoice) === "Void" && "bg-slate-50 text-slate-700 border-slate-100",
                getInvoiceStatus(activeInvoice) === "Refunded" && "bg-rose-50 text-rose-700 border-rose-100"
              )}
            >
              {getInvoiceStatus(activeInvoice)}
            </span>
          )}
        </div>

        {activeInvoice ? (
          <div className="space-y-6">
            
            {/* INVOICE CARD VISUAL PREVIEW */}
            <div className="border border-black p-4 bg-white text-black font-mono text-[9px] leading-tight select-none shadow-xs">
              
              {/* Branding Header */}
              <div className="text-center border-b border-black pb-2 mb-2">
                <h4 className="font-bold text-xs tracking-wider">XINVORA</h4>
                <div className="text-[7.5px] text-slate-500">Premium Lifestyle Brand</div>
              </div>

              {/* Meta */}
              <div className="flex justify-between items-start mb-2 text-[7.5px]">
                <div>
                  <div className="font-bold text-[8.5px] truncate max-w-[120px]">
                    {activeInvoice.shippingAddress?.fullName || activeInvoice.user?.firstName + " " + activeInvoice.user?.lastName}
                  </div>
                  <div className="truncate">{activeInvoice.shippingAddress?.phone || activeInvoice.user?.phone}</div>
                  <div className="text-[7px] text-slate-600 mt-0.5 leading-snug">
                    {activeInvoice.shippingAddress?.street} {activeInvoice.shippingAddress?.landmark && `(${activeInvoice.shippingAddress?.landmark})`}
                    {(activeInvoice.shippingAddress?.street || activeInvoice.shippingAddress?.landmark) && <br />}
                    Ward {activeInvoice.shippingAddress?.wardNumber}, {activeInvoice.shippingAddress?.tole}
                    <br />
                    {activeInvoice.shippingAddress?.municipalityName || activeInvoice.shippingAddress?.municipality || ""}, {activeInvoice.shippingAddress?.districtName || activeInvoice.shippingAddress?.district || ""}
                    <br />
                    {activeInvoice.shippingAddress?.provinceName || activeInvoice.shippingAddress?.province || ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">INV: {activeInvoice.invoiceNumber || "Pending"}</div>
                  <div>ORD: {activeInvoice.orderNumber}</div>
                  <div>{new Date(activeInvoice.createdAt).toLocaleDateString("en-GB")}</div>
                  <div className="mt-1 flex justify-end">
                    <QRCode value={activeInvoice.orderNumber} size={28} level="L" />
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-b border-dashed border-slate-300 py-1.5 my-2">
                <table className="w-full text-left border-collapse text-[7.5px]">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="pb-0.5 font-bold">Item</th>
                      <th className="pb-0.5 text-center font-bold">Qty</th>
                      <th className="pb-0.5 text-right font-bold">Price</th>
                      <th className="pb-0.5 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeInvoice.orderItems?.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-1 truncate max-w-[100px]">
                          <div className="font-bold truncate">{item.productName}</div>
                          <div className="text-[6.5px] text-slate-500 truncate">{item.sku}</div>
                        </td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-1 text-right">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial calculations */}
              <div className="space-y-0.5 text-[8px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(activeInvoice.subtotal)}</span>
                </div>
                {activeInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(activeInvoice.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span>{formatCurrency(activeInvoice.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-[9px] border-t border-black pt-1 mt-1">
                  <span>Grand Total</span>
                  <span>{formatCurrency(activeInvoice.total)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-center mt-3 border-t border-dashed border-slate-200 pt-2 text-[7px] text-slate-500">
                <div className="font-bold text-black uppercase">
                  {activeInvoice.paymentProvider === "CASH_ON_DELIVERY" ? "CASH ON DELIVERY" : "PAID ONLINE"}
                </div>
                <div>Thank you for choosing XINVORA!</div>
              </div>
            </div>

            {/* Sidebar actions */}
            <div className="flex flex-col gap-2 w-full">
              {!activeInvoice.invoiceNumber && (
                <button
                  onClick={async () => {
                    const res = await assignInvoiceNumberAction(activeInvoice.id)
                    if (res.success) {
                      toast.success(`Invoice number generated: ${res.data.invoiceNumber}`)
                      setActiveInvoice((prev: any) => ({ ...prev, invoiceNumber: res.data.invoiceNumber }))
                      // Trigger a page refresh so lists and counts are up to date!
                      router.refresh()
                    } else {
                      toast.error("Failed to generate invoice number.")
                    }
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-admin-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  Generate Invoice No.
                </button>
              )}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => handlePrintSingle(activeInvoice)}
                  className="flex-1 bg-admin-primary hover:bg-admin-primary/95 text-admin-primary-on py-2 rounded-admin-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="h-4 w-4" /> Print Invoice
                </button>
                <button
                  onClick={() => handlePrintSingle(activeInvoice)}
                  className="px-3 py-2 bg-admin-content border border-admin-border text-admin-text-secondary hover:text-admin-text-primary rounded-admin-md hover:bg-admin-content-hover/40 transition-all"
                  title="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Invoice Notes editor */}
            <div className="space-y-2 border-t border-admin-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">
                  Invoice Notes
                </span>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="text-admin-xs font-semibold text-admin-primary hover:underline disabled:opacity-50"
                >
                  {isSavingNotes ? "Saving..." : "+ Save Note"}
                </button>
              </div>
              <textarea
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Add special printing instructions or customer handouts..."
                className="w-full text-xs bg-admin-content border border-admin-border text-admin-text-primary rounded-admin-md p-2 focus:outline-none focus:border-admin-border-strong transition-all leading-normal"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-admin-sm text-admin-text-secondary italic">
            Select an invoice to preview details.
          </div>
        )}
      </div>

    </div>
  )
}
