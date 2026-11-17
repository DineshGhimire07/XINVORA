"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import type { ChatInquiry, ChatMessage } from "@/db/schema"
import {
  markChatReadAction,
  markChatRepliedAction,
  deleteChatAction,
  sendAdminReplyAction,
  getInquiryMessagesAction,
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
  Send,
  User,
  ShieldCheck,
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

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [isPending, startTransition] = useTransition()

  const chatScrollRef = useRef<HTMLDivElement>(null)

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

  // Fetch messages when selected inquiry changes
  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }

    let isCurrent = true
    setLoadingMessages(true)

    getInquiryMessagesAction(selectedId).then((res) => {
      if (isCurrent && res.success) {
        setMessages(res.messages)
        setLoadingMessages(false)
        // Scroll to bottom
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
          }
        }, 100)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [selectedId])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

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
    if (!confirm("Are you sure you want to delete this conversation?")) return
    startTransition(async () => {
      setInquiries((prev) => prev.filter((item) => item.id !== id))
      if (selectedId === id) setSelectedId(null)
      await deleteChatAction(id)
    })
  }

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!replyText.trim() || !selectedId || isSendingReply) return

    const textToSend = replyText.trim()
    setIsSendingReply(true)

    const res = await sendAdminReplyAction({
      inquiryId: selectedId,
      message: textToSend,
    })

    setIsSendingReply(false)

    if (res.success && res.message) {
      setMessages((prev) => [...prev, res.message!])
      setReplyText("")
      // Update local inquiry status
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, status: "REPLIED", updatedAt: new Date() }
            : item
        )
      )
    }
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
                    ? "All Conversations"
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
            placeholder="Search customer, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary"
          />
        </div>
      </div>

      {/* Main Split View: List on left, Full Chatbox on right */}
      {filteredInquiries.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-surface/50">
          <MessageCircle size={32} className="mx-auto text-text-tertiary mb-3 opacity-60" />
          <p className="text-sm font-medium text-text-primary">No conversations found</p>
          <p className="text-xs text-text-secondary mt-1">
            {search ? "Try adjusting your search criteria." : "Customer messages from the chat widget will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* List column */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
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
                      {new Date(inquiry.updatedAt || inquiry.createdAt).toLocaleDateString([], {
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

          {/* Chat details & 2-way conversation column */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-xl flex flex-col h-[calc(100vh-250px)] sticky top-6 overflow-hidden">
            {selectedInquiry ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-4 border-b border-border bg-surface shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-text-primary">
                        {selectedInquiry.customerName || "Anonymous Shopper"}
                      </h2>
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
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
                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                      {selectedInquiry.customerEmail && (
                        <a
                          href={`mailto:${selectedInquiry.customerEmail}`}
                          className="hover:underline flex items-center gap-1 text-text-primary font-medium"
                        >
                          <Mail size={12} /> {selectedInquiry.customerEmail}
                        </a>
                      )}
                      <span>
                        Started: {new Date(selectedInquiry.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {selectedInquiry.status !== "REPLIED" && (
                      <button
                        onClick={() => handleMarkReplied(selectedInquiry.id)}
                        disabled={isPending}
                        title="Mark as Replied"
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-emerald-50 text-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle size={12} />
                        <span>Done</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedInquiry.id)}
                      disabled={isPending}
                      title="Delete conversation"
                      className="p-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Attached Product Context (if present) */}
                {selectedInquiry.productName && (
                  <div className="px-4 py-2 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs shrink-0">
                    <div className="flex items-center gap-2 truncate">
                      <Package size={14} className="text-amber-700 shrink-0" />
                      <span className="text-[11px] font-medium text-amber-950 dark:text-amber-200 truncate">
                        Product: <strong>{selectedInquiry.productName}</strong>
                      </span>
                    </div>
                    {selectedInquiry.productUrl && (
                      <a
                        href={selectedInquiry.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 underline shrink-0"
                      >
                        View <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                )}

                {/* Scrollable Chat History */}
                <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-secondary/40"
                >
                  {loadingMessages ? (
                    <div className="py-8 text-center text-xs text-text-tertiary">
                      Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-3.5 bg-surface rounded-xl border border-border text-xs text-text-primary">
                      {selectedInquiry.message}
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isAdmin = msg.sender === "ADMIN"
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isAdmin ? "items-end" : "items-start"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-text-tertiary">
                            {isAdmin ? (
                              <>
                                <ShieldCheck size={11} className="text-accent" />
                                <span className="font-semibold text-text-secondary">XINVORA Team (You)</span>
                              </>
                            ) : (
                              <>
                                <User size={11} />
                                <span className="font-semibold text-text-secondary">
                                  {selectedInquiry.customerName || "Customer"}
                                </span>
                              </>
                            )}
                            <span>·</span>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                              isAdmin
                                ? "bg-text-primary text-white rounded-br-xs"
                                : "bg-surface border border-border text-text-primary rounded-bl-xs"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Reply Input Box */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 border-t border-border bg-surface shrink-0 space-y-2"
                >
                  <div className="relative flex items-center">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          handleSendReply()
                        }
                      }}
                      placeholder="Type your reply to customer (Cmd/Ctrl + Enter to send)..."
                      rows={2}
                      className="w-full pr-12 pl-3 py-2 text-xs bg-surface-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSendingReply || !replyText.trim()}
                      className="absolute right-2.5 bottom-2.5 p-2 rounded-lg bg-text-primary text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title="Send Reply"
                    >
                      {isSendingReply ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                      ) : (
                        <Send size={13} />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-tertiary px-1">
                    <span>Press Cmd + Enter to send</span>
                    <a
                      href={`https://wa.me/9779743679470`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#128C7E] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      WhatsApp Admin
                    </a>
                  </div>
                </form>
              </>
            ) : (
              <div className="m-auto text-center text-text-tertiary text-xs">
                Select a conversation from the list to start replying.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
