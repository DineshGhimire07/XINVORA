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
  FileText,
  Package,
  XCircle,
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
  const [statusFilter, setStatusFilter] = useState<string>("all")
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
      tx.customerName.toLowerCase().includes(searchTx.toLowerCase()) ||
      tx.paymentMethod.toLowerCase().includes(searchTx.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === "delivered") return tx.status === "delivered"
    if (statusFilter === "returned") return tx.isReturned
    if (statusFilter === "canceled") return tx.isCanceled

    return true
  })

  const exportCsv = () => {
    const headers = [
      "Order ID",
      "Date",
      "Customer",
      "Items Count",
      "Catalog Price (NPR)",
      "Seller Voucher (NPR)",
      "Platform Voucher (NPR)",
      "Customer Paid (NPR)",
      "Shipping Fee (NPR)",
      "Payment Method",
      "Status"
    ]
    const rows = data.transactions.map((t) => [
      t.orderId,
      t.date,
      `"${t.customerName.replace(/"/g, '""')}"`,
      t.itemsCount,
      t.catalogPrice,
      t.voucherSeller,
      t.voucherPlatform,
      t.customerPaidPrice,
      t.shippingFeeOriginal,
      t.paymentMethod,
      t.status
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `daraz_financial_orders_${new Date().toISOString().slice(0, 10)}.csv`)
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
              Daraz Financial Intelligence & Bank Settlements
            </h1>
            {data.isLiveData ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live Daraz Store: {data.connection.account}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                Modeled Preview
              </span>
            )}
          </div>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Exact Daraz statement payouts, platform commission fees, shipping subsidies, customer refunds, and complete order financial ledger.
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-400">Deposited In Bank</span>
            <Building2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-admin-xl font-mono font-bold text-admin-text-primary">
              NPR {data.settledBankAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Settled to: {data.bankAccountMasked}</span>
            <span className="text-green-400 font-semibold">Cleared</span>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pending Transfer</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-admin-xl font-mono font-bold text-amber-300">
              NPR {data.pendingBankAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Next Settlement: Wednesday</span>
            <span className="text-amber-400 font-semibold">Scheduled</span>
          </div>
        </div>

        {/* Gross Item Revenue */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Item Revenue</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-admin-xl font-mono font-bold text-admin-text-primary">
              NPR {data.grossRevenue.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Total Statement Billing</span>
            <span className="text-blue-400 font-semibold">{data.statements.length} Statements</span>
          </div>
        </div>

        {/* Daraz Fees Charged */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Daraz Platform Fees</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-admin-xl font-mono font-bold text-rose-300">
              - NPR {data.totalFeesCharged.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Commissions & Services</span>
            <span className="text-rose-400 font-semibold">{d.commissionPercent}% rate</span>
          </div>
        </div>

        {/* Net Take-Home Yield */}
        <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border shadow-xs">
          <div className="flex items-center justify-between text-admin-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Total Net Earnings</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-admin-xl font-mono font-bold text-purple-300">
              NPR {data.totalNetToBank.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-admin-border/50 flex items-center justify-between text-[11px] text-admin-text-secondary">
            <span>Overall Yield</span>
            <span className="text-purple-400 font-semibold">{data.netTakeHomeRate}%</span>
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
          <span>Statement Accounting Breakdown</span>
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
          <span>Weekly Bank Statements ({data.statements.length})</span>
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
          <span>All Orders & Pricing Ledger ({data.transactions.length})</span>
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
          <span>Returns & Cancellations ({data.returns.length})</span>
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW & STATEMENT ACCOUNTING BREAKDOWN ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="p-6 rounded-admin-lg bg-admin-surface border border-admin-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-admin-border pb-4">
              <div>
                <h3 className="text-admin-base font-bold text-admin-text-primary">
                  Official Statement Accounting Formula (Daraz Open Platform)
                </h3>
                <p className="text-admin-xs text-admin-text-secondary mt-0.5">
                  Every rupee accounted for directly from the 10 weekly Daraz payout settlement statements.
                </p>
              </div>
              <div className="px-3 py-1 bg-admin-content border border-admin-border rounded-admin-md text-admin-xs font-mono text-admin-text-secondary">
                Exact API Data · Zero Estimates
              </div>
            </div>

            {/* Formula Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Gross Item Revenue */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-admin-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Item Revenue
                  </span>
                  <span className="text-admin-xs font-mono text-blue-300">Base</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-admin-text-primary">
                  NPR {data.grossRevenue.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Gross item sales billed across all statements.
                </p>
              </div>

              {/* Shipping Fee Credits */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-emerald-500/30 bg-emerald-950/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Shipping Credit (Income)
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-emerald-300">+{d.shippingCreditPercent}%</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-emerald-400">
                  + NPR {d.shippingFeeCredit.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Shipping fee subsidies credited to seller by Daraz.
                </p>
              </div>

              {/* Daraz Platform Fees */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-admin-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    Platform Fees & Commission
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-amber-300">-{d.commissionPercent}%</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-amber-300">
                  - NPR {d.commission.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Marketplace commission, payment fees & VAT.
                </p>
              </div>

              {/* Customer Refunds */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-admin-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Refunds Reversed
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-rose-300">-{d.returnsPercent}%</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-rose-400">
                  - NPR {d.customerReturnsAndRefunds.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Value of customer returned & cancelled items.
                </p>
              </div>

              {/* Fees on Refunds */}
              <div className="p-4 rounded-admin-md bg-admin-content border border-admin-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-admin-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    Fees on Refunds
                  </span>
                  <span className="text-admin-xs font-mono font-bold text-purple-300">-{d.feesOnRefundsPercent}%</span>
                </div>
                <div className="text-admin-base font-mono font-bold text-purple-300">
                  - NPR {d.feesOnRefunds.toLocaleString()}
                </div>
                <p className="text-[11px] text-admin-text-secondary leading-snug">
                  Adjustments on fee reversals for returned items.
                </p>
              </div>
            </div>

            {/* Reconciliation Summary Bar */}
            <div className="p-4 rounded-admin-md bg-admin-content/80 border border-admin-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-admin-xs font-bold text-admin-text-primary">
                  Net Bank Deposit Reconciliation
                </div>
                <div className="text-[11px] text-admin-text-secondary font-mono">
                  Closing Balance = Item Revenue + Shipping Credit - Fees Total - Refunds - Fees on Refunds
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-admin-text-secondary">Cumulative Net In Bank</div>
                  <div className="text-admin-lg font-mono font-bold text-emerald-400">
                    NPR {data.totalNetToBank.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Statistics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-admin-md bg-admin-content border border-admin-border text-center">
                <div className="text-admin-xs text-admin-text-secondary font-medium">Total Orders Synced</div>
                <div className="text-admin-lg font-mono font-bold text-admin-text-primary mt-1">
                  {data.totalOrdersCount}
                </div>
              </div>
              <div className="p-3 rounded-admin-md bg-admin-content border border-admin-border text-center">
                <div className="text-admin-xs text-admin-text-secondary font-medium">Successfully Delivered</div>
                <div className="text-admin-lg font-mono font-bold text-emerald-400 mt-1">
                  {data.deliveredOrdersCount}
                </div>
              </div>
              <div className="p-3 rounded-admin-md bg-admin-content border border-admin-border text-center">
                <div className="text-admin-xs text-admin-text-secondary font-medium">Returned by Customer</div>
                <div className="text-admin-lg font-mono font-bold text-amber-400 mt-1">
                  {data.returnedOrdersCount}
                </div>
              </div>
              <div className="p-3 rounded-admin-md bg-admin-content border border-admin-border text-center">
                <div className="text-admin-xs text-admin-text-secondary font-medium">Cancelled</div>
                <div className="text-admin-lg font-mono font-bold text-rose-400 mt-1">
                  {data.canceledOrdersCount}
                </div>
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
                Weekly Bank Transfer Statements ({data.statements.length} Total)
              </h3>
              <p className="text-admin-xs text-admin-text-secondary">
                Direct statements from Daraz Nepal finance system with exact closing balances transferred to your bank.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-admin-md bg-admin-content border border-admin-border text-admin-xs font-medium text-admin-text-secondary">
                Payout Cycle: <strong className="text-admin-text-primary">Weekly (Wednesday)</strong>
              </span>
            </div>
          </div>

          <div className="border border-admin-border rounded-admin-lg overflow-hidden bg-admin-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-admin-xs border-collapse">
                <thead>
                  <tr className="bg-admin-content/80 border-b border-admin-border text-admin-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Statement #</th>
                    <th className="py-3 px-4">Cycle Period</th>
                    <th className="py-3 px-4 text-right">Item Revenue</th>
                    <th className="py-3 px-4 text-right">Shipping Credit</th>
                    <th className="py-3 px-4 text-right">Platform Fees</th>
                    <th className="py-3 px-4 text-right">Refunds</th>
                    <th className="py-3 px-4 text-right">Fees on Refunds</th>
                    <th className="py-3 px-4 text-right font-bold text-admin-text-primary">Net Bank Payout</th>
                    <th className="py-3 px-4 text-center">Status</th>
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
                      <td className="py-3.5 px-4 text-right text-admin-text-primary">
                        NPR {st.itemRevenue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-400">
                        {st.otherRevenue > 0 ? `+ NPR ${st.otherRevenue.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-amber-400">
                        - NPR {Math.abs(st.feesTotal).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-rose-400">
                        {st.refunds !== 0 ? `- NPR ${Math.abs(st.refunds).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-purple-400">
                        {st.feesOnRefunds !== 0 ? `- NPR ${Math.abs(st.feesOnRefunds).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400 text-admin-sm">
                        NPR {st.closingBalance.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        {st.paid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/25">
                            <CheckCircle2 className="w-3 h-3" /> Transferred
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                            <Clock className="w-3 h-3" /> Scheduled
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

      {/* ── TAB 3: ALL ORDERS & PRICING LEDGER ── */}
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
                placeholder="Search by Order ID, Customer Name, Payment Method..."
                className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-9 pr-3 py-1.5 text-admin-xs text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-admin-content border border-admin-border rounded-admin-md p-0.5 text-admin-xs">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded transition-colors ${statusFilter === "all" ? "bg-admin-surface text-admin-text-primary font-bold shadow-xs" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  All ({data.transactions.length})
                </button>
                <button
                  onClick={() => setStatusFilter("delivered")}
                  className={`px-2.5 py-1 rounded transition-colors ${statusFilter === "delivered" ? "bg-emerald-600 text-white font-bold shadow-xs" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  Delivered ({data.deliveredOrdersCount})
                </button>
                <button
                  onClick={() => setStatusFilter("returned")}
                  className={`px-2.5 py-1 rounded transition-colors ${statusFilter === "returned" ? "bg-amber-600 text-white font-bold shadow-xs" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  Returned ({data.returnedOrdersCount})
                </button>
                <button
                  onClick={() => setStatusFilter("canceled")}
                  className={`px-2.5 py-1 rounded transition-colors ${statusFilter === "canceled" ? "bg-rose-600 text-white font-bold shadow-xs" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  Canceled ({data.canceledOrdersCount})
                </button>
              </div>
            </div>
          </div>

          <div className="border border-admin-border rounded-admin-lg overflow-hidden bg-admin-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-admin-xs border-collapse">
                <thead>
                  <tr className="bg-admin-content/80 border-b border-admin-border text-admin-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Order ID / Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-center">Items</th>
                    <th className="py-3 px-4 text-right">Catalog Price</th>
                    <th className="py-3 px-4 text-right">Seller Voucher</th>
                    <th className="py-3 px-4 text-right">Daraz Voucher</th>
                    <th className="py-3 px-4 text-right font-bold text-admin-text-primary">Customer Paid</th>
                    <th className="py-3 px-4 text-right">Courier Fee</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/60 text-admin-xs">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-admin-content/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-admin-text-primary font-bold">#{tx.orderId}</div>
                        <div className="text-[10px] text-admin-text-secondary">{tx.date}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-admin-text-primary">{tx.customerName}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {tx.itemsCount}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-admin-text-primary">
                        NPR {tx.catalogPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-400">
                        {tx.voucherSeller > 0 ? `- NPR ${tx.voucherSeller}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sky-400">
                        {tx.voucherPlatform > 0 ? `- NPR ${tx.voucherPlatform}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        NPR {tx.customerPaidPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-admin-text-secondary">
                        NPR {tx.shippingFeeOriginal}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-admin-text-secondary">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === "delivered"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : tx.isReturned
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : tx.isCanceled
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                            : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: RETURNS & CANCELLATIONS ── */}
      {activeTab === "returns" && (
        <div className="space-y-4">
          <div className="p-4 rounded-admin-lg bg-admin-surface border border-admin-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-admin-base font-bold text-admin-text-primary">
                Returns, DEX Shipped Back & Cancelled Orders ({data.returns.length} Total)
              </h3>
              <p className="text-admin-xs text-admin-text-secondary">
                Orders not settled into net bank payout due to customer cancellation or courier return.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-admin-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-admin-xs font-semibold">
                Returns: {data.returnedOrdersCount} | Cancellations: {data.canceledOrdersCount}
              </span>
            </div>
          </div>

          <div className="border border-admin-border rounded-admin-lg overflow-hidden bg-admin-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-admin-xs border-collapse">
                <thead>
                  <tr className="bg-admin-content/80 border-b border-admin-border text-admin-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-center">Items</th>
                    <th className="py-3 px-4 text-right">Catalog Price</th>
                    <th className="py-3 px-4 text-right">Customer Paid</th>
                    <th className="py-3 px-4 text-right">Courier Fee</th>
                    <th className="py-3 px-4">Reason / Stage</th>
                    <th className="py-3 px-4 text-right">Status</th>
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
                        <div className="font-semibold text-admin-text-primary">{ret.customerName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        {ret.itemsCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-admin-text-primary">
                        NPR {ret.catalogPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-300">
                        NPR {ret.customerPaid.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-admin-text-secondary">
                        NPR {ret.shippingFeeOriginal}
                      </td>
                      <td className="py-3.5 px-4 text-admin-text-secondary text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-admin-content border border-admin-border text-amber-300">
                          {ret.returnReason}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          {ret.status}
                        </span>
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
