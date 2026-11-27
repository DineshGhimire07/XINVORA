"use client"

import React, { useState, useTransition } from "react"
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Info,
  ChevronDown,
  Layers,
  ShoppingBag,
  Percent,
  Truck,
  Receipt,
  FileText
} from "lucide-react"
import type { DarazFinanceSummary, DarazFinancialTransaction, DarazPayoutStatement, DarazReturnAnalyticsItem } from "@/services/daraz-finance.service"
import { syncDarazFinanceAction } from "@/actions/admin/daraz-finance.actions"

interface DarazFinanceClientProps {
  initialData: DarazFinanceSummary
}

export function DarazFinanceClient({ initialData }: DarazFinanceClientProps) {
  const [data, setData] = useState<DarazFinanceSummary>(initialData)
  const [activeTab, setActiveTab] = useState<"overview" | "statements" | "transactions" | "returns">("overview")
  const [searchTx, setSearchTx] = useState("")
  const [txTypeFilter, setTxTypeFilter] = useState<string>("all")
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

  // Filtered transactions
  const filteredTransactions = data.transactions.filter((tx) => {
    const matchesSearch =
      !searchTx.trim() ||
      tx.orderId.toLowerCase().includes(searchTx.toLowerCase()) ||
      tx.sku.toLowerCase().includes(searchTx.toLowerCase()) ||
      tx.productTitle.toLowerCase().includes(searchTx.toLowerCase())

    if (!matchesSearch) return false

    if (txTypeFilter === "credit") return tx.transactionType === "Item Price Credit" || tx.transactionType === "Lost Item Reimbursement"
    if (txTypeFilter === "fee") return tx.transactionType.includes("Commission") || tx.transactionType.includes("Fee") || tx.transactionType.includes("VAT")
    if (txTypeFilter === "return") return tx.transactionType.includes("Return") || tx.transactionType.includes("Refund")

    return true
  })

  const exportCsv = () => {
    const headers = ["Transaction ID", "Order ID", "SKU", "Product", "Type", "Gross (NPR)", "Deduction (NPR)", "Net (NPR)", "Statement", "Date", "Status"]
    const rows = data.transactions.map(t => [
      t.id,
      t.orderId,
      t.sku,
      `"${t.productTitle.replace(/"/g, '""')}"`,
      t.transactionType,
      t.grossAmount,
      t.deductionAmount,
      t.netAmount,
      t.statementNumber,
      t.date,
      t.status
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `daraz_financial_ledger_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const d = data.deductionsBreakdown

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-admin-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
              Daraz Financial Ledger & Bank Settlement
            </h1>
            {data.isLiveData ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live Daraz Store Account: {data.connection.account}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                Modeled Preview
              </span>
            )}
          </div>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Real-time accounting breakdown of customer receipts, commission charges, courier fees, return reversals, and net deposits.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-admin-md bg-admin-content border border-admin-border text-admin-xs text-admin-text-secondary">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Bank: <strong className="text-admin-text-primary">{data.bankName}</strong></span>
          </div>

          <button
            onClick={handleSync}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-admin-md bg-admin-primary text-white hover:bg-admin-primary-hover text-admin-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span>{isPending ? "Syncing..." : "Sync Daraz Statements"}</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-admin-md bg-admin-content hover:bg-admin-content-hover border border-admin-border text-admin-xs font-semibold text-admin-text-primary transition-colors"
            title="Download CSV for Excel/Tally"
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

      {/* ── Key Financial KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Deposited in Bank */}
        <div className="p-4 rounded-admin-lg bg-gradient-to-br from-admin-surface to-admin-surface/70 border border-green-500/30 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-400">Total In Bank (Deposited)</span>
            <Building2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-admin-xl font-mono font-bold text-admin-text-primary">
              NPR {data.settledBankAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Settled to: {data.bankAccountMasked}</span>
            <span className="text-green-400 font-semibold">100% Cleared</span>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Next Payout (In Review)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-admin-xl font-mono font-bold text-amber-300">
              NPR {data.pendingBankAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Transfer due: {data.nextPayoutDate}</span>
            <span className="text-amber-400 font-semibold">Processing</span>
          </div>
        </div>

        {/* Gross Sales */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Customer Paid</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-admin-xl font-mono font-bold text-admin-text-primary">
              NPR {data.grossRevenue.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Order Value Collected</span>
            <span className="text-blue-400 font-semibold">100% Gross</span>
          </div>
        </div>

        {/* Total Deductions */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Total Deductions & Fees</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-admin-xl font-mono font-bold text-rose-300">
              - NPR {data.totalDeductions.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Commissions, returns & fees</span>
            <span className="text-rose-400 font-semibold">{(100 - data.netTakeHomeRate).toFixed(1)}%</span>
          </div>
        </div>

        {/* Net Take-Home Yield */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Net Take-Home Yield</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-admin-xl font-mono font-bold text-purple-300">
              {data.netTakeHomeRate}%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Actual Net Profit Ratio</span>
            <span className="text-purple-400 font-semibold">High Efficiency</span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-1 border-b border-admin-border pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-admin-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "border-blue-500 text-blue-400 bg-blue-500/5"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Deductions & Fee Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab("statements")}
          className={`flex items-center gap-2 px-4 py-2.5 text-admin-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "statements"
              ? "border-blue-500 text-blue-400 bg-blue-500/5"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Bank Payout Statements ({data.statements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-admin-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "transactions"
              ? "border-blue-500 text-blue-400 bg-blue-500/5"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Transaction & Item Ledger ({data.transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          className={`flex items-center gap-2 px-4 py-2.5 text-admin-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "returns"
              ? "border-blue-500 text-blue-400 bg-blue-500/5"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Returns, Reversals & Claims ({data.returns.length})</span>
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW & DEDUCTIONS BREAKDOWN ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Deductions Visual Flow Chart */}
          <div className="p-6 rounded-admin-lg bg-admin-surface border border-admin-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-admin-border pb-4">
              <div>
                <h3 className="text-admin-base font-bold text-admin-text-primary">
                  Where Did Every Rupee Go? (Gross Revenue to Bank Payout Flow)
                </h3>
                <p className="text-admin-xs text-admin-text-secondary mt-0.5">
                  Complete breakdown of all deductions deducted by Daraz Nepal before depositing into your bank.
                </p>
              </div>
              <div className="px-3 py-1 bg-admin-content border border-admin-border rounded-admin-md text-admin-xs font-mono text-admin-text-secondary">
                Period: Current Settlement Cycle
              </div>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-2">
              <div className="h-6 w-full rounded-md overflow-hidden flex bg-neutral-800 shadow-inner">
                {/* Net Bank Payout (Green) */}
                <div
                  style={{ width: `${data.netTakeHomeRate}%` }}
                  className="bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center text-[10px] font-bold text-black select-none"
                  title={`Net Bank Payout: ${data.netTakeHomeRate}%`}
                >
                  Bank Payout ({data.netTakeHomeRate}%)
                </div>
                {/* Commission (Amber) */}
                <div
                  style={{ width: `${d.commissionPercent}%` }}
                  className="bg-amber-500 hover:bg-amber-400 transition-colors flex items-center justify-center text-[10px] font-bold text-black select-none"
                  title={`Commission: ${d.commissionPercent}%`}
                >
                  {d.commissionPercent}%
                </div>
                {/* Courier / Shipping (Blue) */}
                <div
                  style={{ width: `${d.shippingPercent}%` }}
                  className="bg-sky-500 hover:bg-sky-400 transition-colors flex items-center justify-center text-[10px] font-bold text-black select-none"
                  title={`Shipping: ${d.shippingPercent}%`}
                >
                  {d.shippingPercent}%
                </div>
                {/* Returns (Rose) */}
                <div
                  style={{ width: `${d.returnsPercent}%` }}
                  className="bg-rose-500 hover:bg-rose-400 transition-colors flex items-center justify-center text-[10px] font-bold text-white select-none"
                  title={`Returns: ${d.returnsPercent}%`}
                >
                  {d.returnsPercent}%
                </div>
                {/* Payment Gateway (Violet) */}
                <div
                  style={{ width: `${d.paymentFeePercent}%` }}
                  className="bg-violet-500 hover:bg-violet-400 transition-colors flex items-center justify-center text-[10px] font-bold text-white select-none"
                  title={`Payment Fee: ${d.paymentFeePercent}%`}
                >
                  {d.paymentFeePercent}%
                </div>
                {/* VAT (Orange) */}
                <div
                  style={{ width: `${d.taxesPercent}%` }}
                  className="bg-orange-500 hover:bg-orange-400 transition-colors flex items-center justify-center text-[10px] font-bold text-white select-none"
                  title={`VAT on Services: ${d.taxesPercent}%`}
                >
                  {d.taxesPercent}%
                </div>
              </div>

              {/* Legend Row */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-admin-text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Net Bank Settlement ({data.netTakeHomeRate}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Daraz Commission ({d.commissionPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>3PL Courier & Logistics ({d.shippingPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Returns & Refunds ({d.returnsPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span>Payment Gateway Fee ({d.paymentFeePercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span>13% VAT on Marketplace Services ({d.taxesPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Individual Itemized Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {/* Daraz Commission */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-admin-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    Marketplace Commission
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-amber-300">{d.commissionPercent}%</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-admin-text-primary">
                  NPR {d.commission.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Standard Daraz commission levied per successful order (approx 10%–12% for Women&apos;s Apparel & Accessories).
                </p>
              </div>

              {/* Payment Gateway Fee */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-admin-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-violet-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Payment Gateway Fee
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-violet-300">{d.paymentFeePercent}%</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-admin-text-primary">
                  NPR {d.paymentGatewayFee.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Payment processing fee for handling eSewa, Khalti, debit cards, and cash collection (COD handling).
                </p>
              </div>

              {/* Courier & Shipping Charges */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-admin-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Courier & Logistics Charges
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-sky-300">{d.shippingPercent}%</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-admin-text-primary">
                  NPR {d.shippingCharges.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Daraz Express / 3PL charges, shipping subsidies, and weight adjustments deducted from seller statements.
                </p>
              </div>

              {/* Customer Returns & Refunds */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-admin-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Returns & Refunds Reversals
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-rose-300">{d.returnsPercent}%</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-admin-text-primary">
                  NPR {d.customerReturnsAndRefunds.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Customer returns reversed from statements (commission is credited back, restocked items preserved in inventory).
                </p>
              </div>

              {/* Government VAT */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-admin-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-orange-400 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    13% VAT on Marketplace Services
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-orange-300">{d.taxesPercent}%</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-admin-text-primary">
                  NPR {d.taxesAndVat.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Nepal VAT applied strictly to Daraz&apos;s service fees and commissions as required by Inland Revenue Department (IRD).
                </p>
              </div>

              {/* Claims & Compensations Recovered */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-emerald-500/30 bg-emerald-950/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Lost Cargo Compensations (Credit)
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-emerald-300">+ Reimbursed</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-emerald-400">
                  + NPR {d.claimsCompensated.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Reimbursements recovered from Daraz for parcels damaged or lost during transit by logistics riders.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: BANK PAYOUT STATEMENTS ── */}
      {activeTab === "statements" && (
        <div className="space-y-4">
          <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-admin-base font-bold text-admin-text-primary">
                Weekly Bank Transfer Statements
              </h3>
              <p className="text-admin-xs text-admin-text-secondary">
                Daraz settles payments on a weekly cycle directly into your registered bank account.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-admin-md bg-admin-content border border-admin-border text-admin-xs font-medium text-admin-text-secondary">
                Payout Day: <strong className="text-admin-text-primary">Every Wednesday</strong>
              </span>
            </div>
          </div>

          <div className="border border-admin-border rounded-admin-lg overflow-hidden bg-admin-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-admin-xs border-collapse">
                <thead>
                  <tr className="bg-admin-content/80 border-b border-admin-border text-admin-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Statement Number</th>
                    <th className="py-3 px-4">Settlement Cycle</th>
                    <th className="py-3 px-4">Gross Collected</th>
                    <th className="py-3 px-4">Total Deductions</th>
                    <th className="py-3 px-4 font-bold text-admin-text-primary">Net Bank Deposit</th>
                    <th className="py-3 px-4">Bank Reference</th>
                    <th className="py-3 px-4">Payout Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/60 font-mono text-admin-xs">
                  {data.statements.map((st) => (
                    <tr key={st.statementNumber} className="hover:bg-admin-content/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-400">
                        {st.statementNumber}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-admin-text-secondary">
                        {st.periodStart} – {st.periodEnd}
                      </td>
                      <td className="py-3.5 px-4 text-admin-text-primary">
                        NPR {st.grossSales.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-rose-400">
                        - NPR {st.totalDeductions.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400 text-admin-sm">
                        NPR {st.netPayout.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-admin-text-secondary text-[11px]">
                        {st.bankReferenceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-admin-text-secondary">
                        {st.payoutDate}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        {st.paidStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/25">
                            <CheckCircle2 className="w-3 h-3" /> Transferred
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                            <Clock className="w-3 h-3" /> In Review
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
      )}

      {/* ── TAB 3: TRANSACTION & ITEM LEDGER ── */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-admin-surface border border-admin-border rounded-admin-lg">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-admin-text-secondary" />
              <input
                type="text"
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                placeholder="Search by Order ID, SKU, or Product..."
                className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-9 pr-3 py-1.5 text-admin-xs text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-admin-content border border-admin-border rounded-admin-md p-0.5 text-admin-xs">
                <button
                  onClick={() => setTxTypeFilter("all")}
                  className={`px-2.5 py-1 rounded transition-colors ${txTypeFilter === "all" ? "bg-admin-surface text-admin-text-primary font-bold shadow-xs" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  All Transactions
                </button>
                <button
                  onClick={() => setTxTypeFilter("credit")}
                  className={`px-2.5 py-1 rounded transition-colors ${txTypeFilter === "credit" ? "bg-emerald-600 text-white font-bold shadow-xs" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  Sales Credits
                </button>
                <button
                  onClick={() => setTxTypeFilter("fee")}
                  className={`px-2.5 py-1 rounded transition-colors ${txTypeFilter === "fee" ? "bg-amber-600 text-white font-bold shadow-xs" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  Deductions & Fees
                </button>
                <button
                  onClick={() => setTxTypeFilter("return")}
                  className={`px-2.5 py-1 rounded transition-colors ${txTypeFilter === "return" ? "bg-rose-600 text-white font-bold shadow-xs" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  Returns / Refunds
                </button>
              </div>
            </div>
          </div>

          <div className="border border-admin-border rounded-admin-lg overflow-hidden bg-admin-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-admin-xs border-collapse">
                <thead>
                  <tr className="bg-admin-content/80 border-b border-admin-border text-admin-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Tx ID / Date</th>
                    <th className="py-3 px-4">Order ID & Item</th>
                    <th className="py-3 px-4">Transaction Type</th>
                    <th className="py-3 px-4">Statement #</th>
                    <th className="py-3 px-4">Gross (NPR)</th>
                    <th className="py-3 px-4">Deduction (NPR)</th>
                    <th className="py-3 px-4 font-bold text-admin-text-primary">Net Amount</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/60 text-admin-xs">
                  {filteredTransactions.map((tx) => {
                    const isCredit = tx.netAmount > 0
                    return (
                      <tr key={tx.id} className="hover:bg-admin-content/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono text-admin-text-primary font-bold">{tx.id}</div>
                          <div className="text-[10px] text-admin-text-secondary">{tx.date}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-admin-text-primary truncate">{tx.productTitle}</div>
                          <div className="text-[10px] text-admin-text-secondary font-mono flex items-center gap-1.5 mt-0.5">
                            <span>Order #{tx.orderId}</span>
                            <span>•</span>
                            <span>{tx.sku}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.transactionType === "Item Price Credit"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : tx.transactionType.includes("Commission")
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                              : tx.transactionType.includes("Return")
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                              : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                          }`}>
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-blue-400 text-[11px]">
                          {tx.statementNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-admin-text-primary">
                          {tx.grossAmount > 0 ? `NPR ${tx.grossAmount.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-rose-400">
                          {tx.deductionAmount > 0 ? `- NPR ${tx.deductionAmount.toLocaleString()}` : "—"}
                        </td>
                        <td className={`py-3 px-4 font-mono font-bold ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isCredit ? `+ NPR ${tx.netAmount.toLocaleString()}` : `- NPR ${Math.abs(tx.netAmount).toLocaleString()}`}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[11px] font-medium text-admin-text-secondary">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: RETURNS, REVERSALS & TRANSIT CLAIMS ── */}
      {activeTab === "returns" && (
        <div className="space-y-4">
          <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-admin-base font-bold text-admin-text-primary">
                Return Audits & Transit Damage Claims
              </h3>
              <p className="text-admin-xs text-admin-text-secondary">
                Track returned fashion garments, customer cancellation reasons, restocked units, and logistics compensation claims.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-admin-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-admin-xs font-semibold">
                Restock Efficiency: 75%
              </span>
            </div>
          </div>

          <div className="border border-admin-border rounded-admin-lg overflow-hidden bg-admin-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-admin-xs border-collapse">
                <thead>
                  <tr className="bg-admin-content/80 border-b border-admin-border text-admin-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Returned Item</th>
                    <th className="py-3 px-4">Customer Reason</th>
                    <th className="py-3 px-4">Item Price</th>
                    <th className="py-3 px-4">Reverse Courier Fee</th>
                    <th className="py-3 px-4">Refund Amount</th>
                    <th className="py-3 px-4 text-right">Inventory & Claim Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/60 text-admin-xs">
                  {data.returns.map((ret) => (
                    <tr key={ret.orderId} className="hover:bg-admin-content/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-admin-text-primary font-bold">#{ret.orderId}</div>
                        <div className="text-[10px] text-admin-text-secondary">{ret.date}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-admin-text-primary">{ret.productTitle}</div>
                        <div className="text-[10px] text-admin-text-secondary font-mono">{ret.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 text-admin-text-secondary">
                        <span className="px-2 py-0.5 rounded bg-admin-content border border-admin-border text-[11px] text-amber-300">
                          {ret.returnReason}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-admin-text-primary">
                        NPR {ret.itemPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-rose-400">
                        {ret.returnShippingFee > 0 ? `- NPR ${ret.returnShippingFee}` : "Free (Daraz Absorbed)"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-300">
                        NPR {ret.refundAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ret.returnStatus === "Restocked" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/25">
                            <CheckCircle2 className="w-3 h-3" /> Back in Stock
                          </span>
                        ) : ret.returnStatus === "Claim Filed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25">
                            <ShieldCheck className="w-3 h-3" /> Claim Filed (Reimbursable)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-500/15 text-neutral-400 border border-neutral-500/25">
                            {ret.returnStatus}
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
      )}
    </div>
  )
}
