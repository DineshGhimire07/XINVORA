"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, ArrowUpRight } from "lucide-react"
import { submitChatInquiryAction } from "@/actions/storefront/chat.actions"
import { usePathname } from "next/navigation"

const WA_NUMBER = "9779743679470"

interface ProductContext {
  id: string
  name: string
  slug: string
}

type Step = "idle" | "open" | "sent"

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let sid = sessionStorage.getItem("xinvora_sid")
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem("xinvora_sid", sid)
  }
  return sid
}

export function ChatWidget() {
  const pathname = usePathname()
  const [step, setStep] = useState<Step>("idle")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [productContext, setProductContext] = useState<ProductContext | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)
  const msgRef = useRef<HTMLTextAreaElement>(null)

  // Sync product context from window or custom event
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

  // Clear product context if not on a product page
  useEffect(() => {
    if (!pathname.startsWith("/products/")) {
      setProductContext(null)
    }
  }, [pathname])

  // Close on outside click
  useEffect(() => {
    if (step !== "open") return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setStep("idle")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [step])

  // Focus message textarea on open
  useEffect(() => {
    if (step === "open") {
      setTimeout(() => msgRef.current?.focus(), 150)
    }
  }, [step])

  const pageUrl = typeof window !== "undefined" ? window.location.href : ""

  const waMessage = productContext
    ? `Hello XINVORA, I would like to inquire about "${productContext.name}". Link: ${pageUrl}`
    : `Hello XINVORA, I would like to make an inquiry.`

  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!message.trim()) return
      setLoading(true)
      setError("")

      const res = await submitChatInquiryAction({
        message: message.trim(),
        customerName: name.trim() || undefined,
        customerEmail: email.trim() || undefined,
        productId: productContext?.id,
        productName: productContext?.name,
        productUrl: pageUrl,
        sessionId: getSessionId(),
      })

      setLoading(false)
      if (res.success) {
        setStep("sent")
        setMessage("")
        setName("")
        setEmail("")
      } else {
        setError(res.error ?? "Unable to transmit inquiry. Please reach out via WhatsApp.")
      }
    },
    [message, name, email, productContext, pageUrl]
  )

  return (
    <>
      {/* Atelier Advisory Concierge Panel */}
      {step !== "idle" && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Client Advisory & Inquiries"
          className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 z-[200] w-[calc(100vw-2rem)] max-w-sm bg-background border border-border shadow-[0_16px_40px_rgba(0,0,0,0.12)] rounded-none flex flex-col transition-all duration-300"
          style={{ maxHeight: "calc(100dvh - 5.5rem)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border/60 bg-surface/50">
            <div>
              <p className="text-[10px] font-sans font-bold tracking-[0.25em] text-accent uppercase select-none">
                Client Advisory
              </p>
              <h3 className="font-display text-base uppercase tracking-[0.12em] text-text-primary mt-0.5">
                Talk to Team
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5 font-light">
                Direct inquiry & bespoke assistance
              </p>
            </div>
            <button
              onClick={() => setStep("idle")}
              className="text-text-secondary hover:text-text-primary transition-colors p-1 -mr-1"
              aria-label="Close panel"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {step === "sent" ? (
              /* Sent Confirmation State */
              <div className="py-8 text-center space-y-3">
                <span className="text-[10px] font-sans font-bold tracking-[0.25em] text-accent uppercase block">
                  Received
                </span>
                <h4 className="font-display text-lg uppercase tracking-[0.1em] text-text-primary">
                  Inquiry Transmitted
                </h4>
                <p className="text-xs text-text-secondary font-light leading-relaxed max-w-xs mx-auto">
                  Our team has logged your inquiry. For priority or immediate response, connect directly on WhatsApp.
                </p>

                <div className="pt-3">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 border border-text-primary bg-text-primary text-surface hover:bg-black/85 text-[10px] font-sans font-medium tracking-[0.2em] uppercase py-3 transition-colors select-none"
                  >
                    <span>WhatsApp Concierge</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("open")}
                  className="text-[10px] font-sans uppercase tracking-[0.15em] text-text-tertiary hover:text-text-primary transition-colors pt-2 block mx-auto underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              /* Inquiry Form */
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Product Context Banner */}
                {productContext && (
                  <div className="border-l border-accent pl-3 py-1.5 bg-surface/60 border-t border-r border-b border-border/40">
                    <span className="text-[9px] font-sans uppercase tracking-[0.22em] text-accent font-semibold block select-none">
                      Piece in Inquiry
                    </span>
                    <p className="font-display text-xs tracking-wide text-text-primary truncate mt-0.5">
                      {productContext.name}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-sans font-semibold tracking-[0.18em] uppercase text-text-secondary mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-xs bg-surface border border-border focus:border-text-primary text-text-primary placeholder:text-text-disabled outline-none rounded-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-sans font-semibold tracking-[0.18em] uppercase text-text-secondary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-xs bg-surface border border-border focus:border-text-primary text-text-primary placeholder:text-text-disabled outline-none rounded-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-sans font-semibold tracking-[0.18em] uppercase text-text-secondary mb-1">
                    Inquiry <span className="text-accent">*</span>
                  </label>
                  <textarea
                    ref={msgRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Sizing advice, styling inquiries, availability, or custom requests..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-xs bg-surface border border-border focus:border-text-primary text-text-primary placeholder:text-text-disabled outline-none rounded-none resize-none leading-relaxed transition-colors"
                    required
                  />
                </div>

                {error && (
                  <p className="text-[11px] text-red-600 font-light">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full bg-text-primary text-surface hover:bg-black/85 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-sans font-semibold tracking-[0.22em] uppercase py-3 transition-colors rounded-none select-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-3 h-3 border border-surface/40 border-t-surface rounded-full animate-spin" />
                  ) : null}
                  <span>{loading ? "Transmitting..." : "Send Inquiry"}</span>
                </button>
              </form>
            )}
          </div>

          {/* WhatsApp Fast Reply Section */}
          <div className="px-6 py-3.5 border-t border-border/60 bg-surface/40">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-border hover:border-text-primary bg-surface hover:bg-surface-secondary text-text-primary text-[10px] font-sans font-medium tracking-[0.18em] uppercase py-2.5 px-3 flex items-center justify-between transition-colors select-none group"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                <span>WhatsApp for fast reply</span>
              </div>
              <ArrowUpRight size={12} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger — Subtle luxury atelier pill */}
      <button
        onClick={() => setStep((s) => (s === "idle" ? "open" : "idle"))}
        aria-label="Talk to team"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[200] border border-border hover:border-text-primary bg-background/95 backdrop-blur-sm text-text-primary px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 select-none group"
      >
        <div className="flex items-center gap-2">
          {step === "idle" ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase">
                Talk to team
              </span>
            </>
          ) : (
            <>
              <X size={13} strokeWidth={1.5} />
              <span className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase">
                Close
              </span>
            </>
          )}
        </div>
      </button>
    </>
  )
}
