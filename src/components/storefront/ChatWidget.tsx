"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, ArrowUpRight, Headset, Send, RefreshCw, ShieldCheck } from "lucide-react"
import {
  submitChatInquiryAction,
  getCustomerChatHistoryAction,
} from "@/actions/storefront/chat.actions"
import { usePathname } from "next/navigation"
import type { ChatMessage, ChatInquiry } from "@/db/schema"

const WA_NUMBER = "9779743679470"

interface ProductContext {
  id: string
  name: string
  slug: string
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""
  let sid = localStorage.getItem("xinvora_chat_session_id")
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem("xinvora_chat_session_id", sid)
  }
  return sid
}

export function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [productContext, setProductContext] = useState<ProductContext | null>(null)

  // Live conversation thread state
  const [inquiry, setInquiry] = useState<ChatInquiry | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [replyText, setReplyText] = useState("")
  const [sendingReply, setSendingReply] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const msgInputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize session ID
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)
  }, [])

  // Sync product context from window / event
  useEffect(() => {
    if (typeof window !== "undefined") {
      const existing = (window as unknown as { __XINVORA_PRODUCT__?: ProductContext | null }).__XINVORA_PRODUCT__
      if (existing) {
        setProductContext(existing)
      }
    }

    const handler = (e: Event) => {
      const custom = e as CustomEvent<ProductContext | null>
      setProductContext(custom.detail || null)
    }

    window.addEventListener("xinvora:product-view", handler)
    return () => window.removeEventListener("xinvora:product-view", handler)
  }, [])

  // Fetch chat history whenever session ID is available or drawer opens
  const fetchChatHistory = useCallback(async () => {
    if (!sessionId) return
    const res = await getCustomerChatHistoryAction(sessionId)
    if (res.success) {
      if (res.inquiry) setInquiry(res.inquiry)
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages)
      }
    }
  }, [sessionId])

  useEffect(() => {
    if (sessionId) {
      fetchChatHistory()
    }
  }, [sessionId, fetchChatHistory])

  // Poll for admin replies every 4 seconds when chat panel is open
  useEffect(() => {
    if (!isOpen || !sessionId || !inquiry) return
    const interval = setInterval(() => {
      fetchChatHistory()
    }, 4000)
    return () => clearInterval(interval)
  }, [isOpen, sessionId, inquiry, fetchChatHistory])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen])

  // Focus message textarea on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => msgInputRef.current?.focus(), 150)
    }
  }, [isOpen])

  const pageUrl = typeof window !== "undefined" ? window.location.href : ""

  const waMessage = productContext
    ? `Hello XINVORA, I would like to inquire about "${productContext.name}". Link: ${pageUrl}`
    : `Hello XINVORA, I would like to make an inquiry.`

  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`

  // Submit initial inquiry
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !sessionId) return
    setLoading(true)
    setError("")

    const res = await submitChatInquiryAction({
      message: message.trim(),
      customerName: name.trim() || undefined,
      customerEmail: email.trim() || undefined,
      productId: productContext?.id,
      productName: productContext?.name,
      productUrl: pageUrl,
      sessionId,
    })

    setLoading(false)
    if (res.success) {
      if (res.inquiry) setInquiry(res.inquiry)
      if (res.messages) setMessages(res.messages)
      setMessage("")
    } else {
      setError(res.error ?? "Failed to transmit inquiry.")
    }
  }

  // Send follow-up message in active chat thread
  const handleSendFollowUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!replyText.trim() || !sessionId || sendingReply) return

    const textToSend = replyText.trim()
    setSendingReply(true)
    setError("")

    // Optimistically append customer message
    const tempMsg: ChatMessage = {
      id: crypto.randomUUID(),
      inquiryId: inquiry?.id || "",
      sender: "CUSTOMER",
      message: textToSend,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, tempMsg])
    setReplyText("")

    const res = await submitChatInquiryAction({
      message: textToSend,
      customerName: inquiry?.customerName || name.trim() || undefined,
      customerEmail: inquiry?.customerEmail || email.trim() || undefined,
      productId: productContext?.id || inquiry?.productId || undefined,
      productName: productContext?.name || inquiry?.productName || undefined,
      productUrl: pageUrl || inquiry?.productUrl || undefined,
      sessionId,
    })

    setSendingReply(false)
    if (res.success) {
      if (res.messages) setMessages(res.messages)
      if (res.inquiry) setInquiry(res.inquiry)
    } else {
      setError("Failed to send message.")
    }
  }

  // Start new conversation / reset session
  const handleStartNewTopic = () => {
    if (!confirm("Start a new inquiry thread? Your previous session will be closed.")) return
    const newSid = crypto.randomUUID()
    localStorage.setItem("xinvora_chat_session_id", newSid)
    setSessionId(newSid)
    setInquiry(null)
    setMessages([])
    setMessage("")
    setReplyText("")
  }

  return (
    <>
      {/* Client Advisory Live Chat Box */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Client Advisory Live Chat"
          className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 z-[200] w-[calc(100vw-2rem)] max-w-sm bg-background border border-border shadow-[0_16px_40px_rgba(0,0,0,0.14)] rounded-none flex flex-col transition-all duration-300"
          style={{ height: "520px", maxHeight: "calc(100dvh - 5.5rem)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-surface/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                <Headset size={14} strokeWidth={1.5} className="text-text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-sans font-bold tracking-[0.22em] text-accent uppercase select-none">
                  Client Support
                </p>
                <h3 className="font-display text-xs uppercase tracking-[0.1em] text-text-primary">
                  XINVORA Atelier
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleStartNewTopic}
                  title="Start a new conversation"
                  className="text-[9px] font-sans tracking-wider uppercase text-text-tertiary hover:text-text-primary transition-colors px-1"
                >
                  New Topic
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors p-1"
                aria-label="Close panel"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Piece in Inquiry banner (if on PDP or inquiry attached) */}
          {(productContext?.name || inquiry?.productName) && (
            <div className="border-b border-border/40 px-5 py-2 bg-surface/40 flex items-center justify-between gap-2 shrink-0">
              <div className="truncate">
                <span className="text-[8px] font-sans uppercase tracking-[0.2em] text-accent font-semibold block select-none">
                  Piece in Inquiry
                </span>
                <p className="font-display text-xs tracking-wide text-text-primary truncate">
                  {productContext?.name || inquiry?.productName}
                </p>
              </div>
            </div>
          )}

          {/* WhatsApp Fast Reply Strip */}
          <div className="px-5 py-2 border-b border-border/40 bg-surface/20 shrink-0">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-border/80 hover:border-text-primary bg-surface/90 text-text-primary text-[9px] font-sans font-medium tracking-[0.16em] uppercase py-1.5 px-3 flex items-center justify-between transition-colors select-none group"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                <span>WhatsApp for fast reply</span>
              </div>
              <ArrowUpRight size={11} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
            </a>
          </div>

          {/* Main Area: Thread or Initial Form */}
          {messages.length > 0 ? (
            /* Active Live Chat Thread View */
            <div className="flex-1 flex flex-col min-h-0 bg-background/50">
              {/* Messages Scroll Area */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5"
              >
                {messages.map((msg) => {
                  const isAdmin = msg.sender === "ADMIN"
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isAdmin ? "items-start" : "items-end"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1 px-1 text-[9px] text-text-tertiary">
                        {isAdmin && (
                          <span className="font-semibold text-accent uppercase tracking-wider">
                            Advisor
                          </span>
                        )}
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                          isAdmin
                            ? "bg-surface border border-border/80 text-text-primary"
                            : "bg-text-primary text-surface"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Follow-up input form */}
              <form
                onSubmit={handleSendFollowUp}
                className="p-3 border-t border-border/60 bg-surface shrink-0"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-xs bg-background border border-border focus:border-text-primary text-text-primary placeholder:text-text-disabled outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="p-2.5 bg-text-primary text-surface hover:bg-black/85 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                    aria-label="Send message"
                  >
                    {sendingReply ? (
                      <span className="w-3.5 h-3.5 border border-surface/40 border-t-surface rounded-full animate-spin block" />
                    ) : (
                      <Send size={13} />
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* First Time Inquiry Form */
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <form onSubmit={handleInitialSubmit} className="space-y-3">
                <p className="text-[11px] text-text-secondary leading-relaxed font-light">
                  Send a message to our client advisors. You can track replies directly in this chat box.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-sans font-semibold tracking-[0.18em] uppercase text-text-secondary mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-2.5 py-1.5 text-xs bg-surface border border-border focus:border-text-primary text-text-primary placeholder:text-text-disabled outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-sans font-semibold tracking-[0.18em] uppercase text-text-secondary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-2.5 py-1.5 text-xs bg-surface border border-border focus:border-text-primary text-text-primary placeholder:text-text-disabled outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-sans font-semibold tracking-[0.18em] uppercase text-text-secondary mb-1">
                    Your Inquiry <span className="text-accent">*</span>
                  </label>
                  <textarea
                    ref={msgInputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Sizing recommendations, delivery timings, styling advice..."
                    rows={4}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border focus:border-text-primary text-text-primary placeholder:text-text-disabled outline-none resize-none leading-relaxed transition-colors"
                    required
                  />
                </div>

                {error && (
                  <p className="text-[10px] text-red-600 font-light">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full bg-text-primary text-surface hover:bg-black/85 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-sans font-semibold tracking-[0.2em] uppercase py-2.5 transition-colors select-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-3 h-3 border border-surface/40 border-t-surface rounded-full animate-spin" />
                  ) : null}
                  <span>{loading ? "Starting Chat..." : "Start Conversation"}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Trigger — Minimalist support icon button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close Support Panel" : "Customer Support"}
        title="Customer Support & Live Advisory"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[200] w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-border/80 hover:border-text-primary bg-background/95 backdrop-blur-sm text-text-primary shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:scale-105 active:scale-95 transition-all duration-200 select-none group"
      >
        {isOpen ? (
          <X size={18} strokeWidth={1.5} className="text-text-primary" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Headset size={19} strokeWidth={1.5} className="text-text-primary group-hover:text-accent transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-background" />
          </div>
        )}
      </button>
    </>
  )
}
