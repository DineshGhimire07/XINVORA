"use client"

import { useState, useTransition } from "react"
import type { ChatInquiry } from "@/db/schema"
import {
  markChatReadAction,
  markChatRepliedAction,
  deleteChatAction,
} from "@/actions/admin/chat.actions"
import {
  MessageCircle,
  Mail,
  ExternalLink,
  Trash2,
  CheckCircle,
  Eye,
  Clock,
  Package,
  Search,
} from "lucide-react"

interface InboxClientProps {
  initialInquiries: ChatInquiry[]
}

export function InboxClient({ initialInquiries }: InboxClientProps) {
  const [inquiries, setInquiries] = useState<ChatInquiry[]>(initialInquiries)
  const [filter, setFilter] = useState<"ALL" | "NEW" | "READ" | "REPLIED">("ALL")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(
    initialInquiries[0]?.id || null
  )
  const [isPending, startTransition] = useTransition()

  const filteredInquiries = inquiries.filter((item) => {
    if (filter !== "ALL" && item.status !== filter) return false
    if (!search.trim()) return true
    const term = search.toLowerCase()
    return (
      (item.customerName && item.customerName.toLowerCase().includes(term)) ||
      (item.customerEmail && item.customerEmail.toLowerCase().includes(term)) ||
      item.message.toLowerCase().includes(term) ||
      (item.productName && item.productName.toLowerCase().includes(term))
    )
  })

  const selectedInquiry = inquiries.find((i) => i.id === selectedId) || null

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "READ" } : item))
      )
      await markChatReadAction(id)
    })
  }

  const handleMarkReplied = (id: string) => {
    startTransition(async () => {
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "REPLIED" } : item))
      )
      await markChatRepliedAction(id)
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return
    startTransition(async () => {
      setInquiries((prev) => prev.filter((item) => item.id !== id))
      if (selectedId === id) setSelectedId(null)
      await deleteChatAction(id)
    })
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-surface p-4 border border-border rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "NEW", "READ", "REPLIED"] as const).map((tab) => {
            const count =
              tab === "ALL"
                ? inquiries.length
                : inquiries.filter((i) => i.status === tab).length
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                  filter === tab
                    ? "bg-text-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                }`}
              >
                <span>
                  {tab === "ALL"
                    ? "All Messages"
                    : tab === "NEW"
                    ? "New"
                    : tab === "READ"
                    ? "Read"
                    : "Replied"}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filter === tab
                      ? "bg-white/20 text-white"
                      : "bg-surface-secondary text-text-tertiary"
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search inquiries, products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary"
          />
        </div>
      </div>

      {/* Main Split View: List on left, Details on right */}
      {filteredInquiries.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-surface/50">
          <MessageCircle size={32} className="mx-auto text-text-tertiary mb-3 opacity-60" />
          <p className="text-sm font-medium text-text-primary">No inquiries found</p>
          <p className="text-xs text-text-secondary mt-1">
            {search ? "Try adjusting your search criteria." : "New messages from the storefront chat widget will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* List column */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredInquiries.map((inquiry) => {
              const isSelected = inquiry.id === selectedId
              const isNew = inquiry.status === "NEW"
              const isReplied = inquiry.status === "REPLIED"

              return (
                <div
                  key={inquiry.id}
                  onClick={() => {
                    setSelectedId(inquiry.id)
                    if (isNew) handleMarkRead(inquiry.id)
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-surface-secondary border-text-primary shadow-sm"
                      : "bg-surface border-border hover:border-text-secondary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-xs text-text-primary truncate">
                        {inquiry.customerName || "Anonymous Shopper"}
                      </span>
                      {isNew && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-text-tertiary shrink-0 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(inquiry.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {inquiry.productName && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-medium mb-1.5 max-w-full truncate">
                      <Package size={10} className="shrink-0" />
                      <span className="truncate">{inquiry.productName}</span>
                    </div>
                  )}

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {inquiry.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-text-tertiary truncate">
                      {inquiry.customerEmail || "No email provided"}
                    </span>
                    <span
                      className={`font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isNew
                          ? "bg-red-500/15 text-red-600 dark:text-red-400"
                          : isReplied
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-text-secondary/15 text-text-secondary"
                      }`}
                    >
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Details column */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-6 sticky top-6 space-y-6">
            {selectedInquiry ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-text-primary">
                        {selectedInquiry.customerName || "Anonymous Shopper"}
                      </h2>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          selectedInquiry.status === "NEW"
                            ? "bg-red-500/15 text-red-600 dark:text-red-400"
                            : selectedInquiry.status === "REPLIED"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-text-secondary/15 text-text-secondary"
                        }`}
                      >
                        {selectedInquiry.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Received{" "}
                      {new Date(selectedInquiry.createdAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {selectedInquiry.status !== "REPLIED" && (
                      <button
                        onClick={() => handleMarkReplied(selectedInquiry.id)}
                        disabled={isPending}
                        title="Mark as Replied"
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-emerald-50 text-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle size={13} />
                        <span>Replied</span>
                      </button>
                    )}
                    {selectedInquiry.status === "NEW" && (
                      <button
                        onClick={() => handleMarkRead(selectedInquiry.id)}
                        disabled={isPending}
                        title="Mark as Read"
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-secondary text-text-primary transition-colors flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Read</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedInquiry.id)}
                      disabled={isPending}
                      title="Delete inquiry"
                      className="p-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Contact info row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface-secondary p-3.5 rounded-lg border border-border">
                  <div>
                    <span className="text-text-tertiary block text-[10px] uppercase font-semibold">
                      Email Address
                    </span>
                    {selectedInquiry.customerEmail ? (
                      <a
                        href={`mailto:${selectedInquiry.customerEmail}?subject=Re: Your XINVORA inquiry`}
                        className="text-text-primary hover:underline font-medium inline-flex items-center gap-1 mt-0.5"
                      >
                        <Mail size={12} />
                        {selectedInquiry.customerEmail}
                      </a>
                    ) : (
                      <span className="text-text-tertiary">Not provided</span>
                    )}
                  </div>
                  <div>
                    <span className="text-text-tertiary block text-[10px] uppercase font-semibold">
                      Session / Client ID
                    </span>
                    <span className="font-mono text-[11px] text-text-secondary truncate block mt-0.5">
                      {selectedInquiry.sessionId || "Direct Web Client"}
                    </span>
                  </div>
                </div>

                {/* Product Context */}
                {selectedInquiry.productName && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 tracking-wider block mb-1">
                      Attached Product Context
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-amber-700 shrink-0" />
                        <span className="font-semibold text-xs text-amber-950 dark:text-amber-200">
                          {selectedInquiry.productName}
                        </span>
                      </div>
                      {selectedInquiry.productUrl && (
                        <a
                          href={selectedInquiry.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-950 underline shrink-0"
                        >
                          View Product <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div>
                  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                    Customer Message
                  </h3>
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border whitespace-pre-wrap text-sm text-text-primary leading-relaxed">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {selectedInquiry.customerEmail && (
                    <a
                      href={`mailto:${selectedInquiry.customerEmail}?subject=XINVORA Inquiry Response&body=Hi ${selectedInquiry.customerName || "there"},%0D%0A%0D%0AThank you for reaching out to XINVORA regarding your inquiry:%0D%0A"${encodeURIComponent(selectedInquiry.message)}"%0D%0A%0D%0A`}
                      className="px-4 py-2 rounded-lg bg-text-primary text-white text-xs font-semibold hover:opacity-90 inline-flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Mail size={14} /> Reply via Email
                    </a>
                  )}
                  <a
                    href={`https://wa.me/9779743679470`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1db954] inline-flex items-center gap-2 transition-all shadow-sm"
                  >
                    Open WhatsApp Admin
                  </a>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-text-tertiary text-xs">
                Select an inquiry from the list to view full details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
