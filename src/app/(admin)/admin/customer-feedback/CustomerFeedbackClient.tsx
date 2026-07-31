"use client"

import * as React from "react"
import { Eye, Bell, MessageSquare, X, CheckCircle, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import { updateInquiryStatusAction } from "@/actions/inquiry.actions"
import { useRouter } from "next/navigation"

type Inquiry = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  createdAt: string | Date
}

type StockAlert = {
  id: string
  productId: string
  productName: string
  name: string
  phone: string
  email: string
  notified: boolean
  createdAt: string | Date
}

interface Props {
  inquiries: Inquiry[]
  stockAlerts: StockAlert[]
  totalPages: number
  currentPage: number
  currentStatus: string
}

export function CustomerFeedbackClient({
  inquiries,
  stockAlerts,
  totalPages,
  currentPage,
  currentStatus,
}: Props) {
  const [activeTab, setActiveTab] = React.useState<"inquiries" | "stock-alerts">("inquiries")
  const [selectedInquiry, setSelectedInquiry] = React.useState<Inquiry | null>(null)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const router = useRouter()

  const newInquiriesCount = inquiries.filter((i) => i.status === "NEW").length
  const pendingAlertsCount = stockAlerts.filter((a) => !a.notified).length

  const handleStatusUpdate = async (id: string, status: "NEW" | "READ" | "RESPONDED") => {
    setUpdatingId(id)
    await updateInquiryStatusAction(id, status)
    setUpdatingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-display-sm font-display uppercase tracking-wider text-text-primary">
            Customer Feedback
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Contact form inquiries, stock alerts, and customer requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {newInquiriesCount > 0 && (
            <span className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-1.5 rounded">
              <MessageSquare className="w-3 h-3" />
              {newInquiriesCount} New {newInquiriesCount === 1 ? "Inquiry" : "Inquiries"}
            </span>
          )}
          {pendingAlertsCount > 0 && (
            <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded">
              <Bell className="w-3 h-3" />
              {pendingAlertsCount} Stock {pendingAlertsCount === 1 ? "Alert" : "Alerts"}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "inquiries"
              ? "border-text-primary text-text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Contact Inquiries
          {newInquiriesCount > 0 && (
            <span className="ml-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {newInquiriesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("stock-alerts")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "stock-alerts"
              ? "border-text-primary text-text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Stock Alerts
          {pendingAlertsCount > 0 && (
            <span className="ml-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* ====== INQUIRIES TAB ====== */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "NEW", "READ", "RESPONDED"] as const).map((s) => (
              <Link
                key={s}
                href={`/admin/customer-feedback?status=${s}`}
                className={`px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest border rounded transition-colors ${
                  currentStatus === s || (s === "all" && !currentStatus)
                    ? s === "NEW"
                      ? "bg-red-700 text-white border-red-700"
                      : s === "READ"
                      ? "bg-amber-600 text-white border-amber-600"
                      : s === "RESPONDED"
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-text-primary text-white border-text-primary"
                    : "bg-surface border-border text-text-secondary hover:bg-surface-secondary"
                }`}
              >
                {s === "all" ? "All" : s}
              </Link>
            ))}
          </div>

          {/* Inquiries Table */}
          <div className="bg-white border border-border shadow-sm rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border text-xs uppercase tracking-wider text-text-secondary">
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Sender</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-text-primary divide-y divide-border">
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-text-secondary text-sm">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No inquiries found.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-surface-secondary/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                            inq.status === "NEW"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : inq.status === "READ"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}>
                            {inq.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap text-xs" suppressHydrationWarning>
                          {new Date(inq.createdAt).toLocaleDateString("en-NP", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-text-primary">{inq.name}</div>
                          <div className="text-xs text-text-secondary truncate w-40">{inq.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-48 md:w-64 font-medium text-sm">{inq.subject}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-bold text-accent hover:text-accent/80 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/admin/customer-feedback?page=${i + 1}&status=${currentStatus}`}
                  className={`w-8 h-8 flex items-center justify-center rounded border text-xs ${
                    currentPage === i + 1
                      ? "bg-text-primary text-white border-text-primary"
                      : "bg-surface border-border text-text-secondary hover:bg-surface-secondary"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== STOCK ALERTS TAB ====== */}
      {activeTab === "stock-alerts" && (
        <div className="space-y-4">
          <div className="bg-white border border-border shadow-sm rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border text-xs uppercase tracking-wider text-text-secondary">
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Product</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-text-primary divide-y divide-border">
                  {stockAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-text-secondary text-sm">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No stock alert requests yet.
                      </td>
                    </tr>
                  ) : (
                    stockAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-surface-secondary/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                            alert.notified
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {alert.notified ? "Notified" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap" suppressHydrationWarning>
                          {new Date(alert.createdAt).toLocaleDateString("en-NP", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{alert.name || "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`tel:${alert.phone}`}
                            className="text-accent hover:underline font-mono text-sm"
                          >
                            {alert.phone || "—"}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/products?q=${encodeURIComponent(alert.productName)}`}
                            className="text-text-primary hover:text-accent transition-colors font-medium text-sm truncate block max-w-[200px]"
                          >
                            {alert.productName || "—"}
                          </Link>
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

      {/* ====== INQUIRY DETAIL DRAWER ====== */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedInquiry(null)}
          />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                  Inquiry Details
                </h2>
                <p className="text-xs text-text-secondary mt-0.5" suppressHydrationWarning>
                  {new Date(selectedInquiry.createdAt).toLocaleString("en-NP")}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded hover:bg-surface-secondary transition-colors text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sender Info */}
            <div className="px-6 py-4 border-b border-border bg-surface-secondary/50">
              <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-2">From</div>
              <div className="font-semibold text-text-primary">{selectedInquiry.name}</div>
              <div className="text-sm text-text-secondary mt-0.5">{selectedInquiry.email}</div>
            </div>

            {/* Subject & Message */}
            <div className="px-6 py-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-1">Subject</div>
                <div className="font-semibold text-text-primary">{selectedInquiry.subject}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-2">Message</div>
                <div className="text-sm text-text-primary leading-relaxed bg-surface-secondary/50 p-4 rounded border border-border whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="px-6 py-4 border-t border-border space-y-2">
              <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-2">Update Status</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(selectedInquiry.id, "READ")}
                  disabled={updatingId === selectedInquiry.id || selectedInquiry.status === "READ"}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 text-[10px] font-bold uppercase tracking-wider border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-40 rounded"
                >
                  <Clock className="w-3 h-3" />
                  Mark Read
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedInquiry.id, "RESPONDED")}
                  disabled={updatingId === selectedInquiry.id || selectedInquiry.status === "RESPONDED"}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 text-[10px] font-bold uppercase tracking-wider border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-40 rounded"
                >
                  <CheckCircle className="w-3 h-3" />
                  Mark Responded
                </button>
              </div>
              {selectedInquiry.email && (
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                  className="flex w-full items-center justify-center gap-1.5 h-9 text-[10px] font-bold uppercase tracking-wider bg-text-primary text-white hover:bg-text-primary/90 transition-colors rounded"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reply via Email
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
