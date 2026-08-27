"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Share2, Check, Copy, X, Sparkles, Send, ExternalLink } from "lucide-react"
import Image from "next/image"
import { optimizeCloudinaryUrl } from "@/lib/image-optimizer"

export interface ProductShareButtonProps {
  productName: string
  categoryName?: string
  imageUrl?: string
  shortDescription?: string
  variant?: "header" | "pill" | "icon" | "inline"
  className?: string
}

/* ── Custom Luxury SVG Icons for Social Channels ── */
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  )
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

function PinterestIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M8 12a4 4 0 1 1 8 0c0 3-2 5.5-4 5.5s-2-1.5-2-3c0-2.5 1.5-4 3.5-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

function XTwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export function ProductShareButton({
  productName,
  categoryName,
  imageUrl,
  shortDescription,
  variant = "header",
  className = "",
}: ProductShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [canNativeShare, setCanNativeShare] = useState(false)

  // Detect native share capability
  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true)
    }
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Get current full product URL safely
  const getProductUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.location.href
    }
    return ""
  }, [])

  const shareText = `Discover ${productName} by XINVORA${categoryName ? ` · ${categoryName}` : ""}.`

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2800)
  }

  // Copy link handler
  const handleCopyLink = async () => {
    try {
      const url = getProductUrl()
      await navigator.clipboard.writeText(url)
      setCopied(true)
      showToast("Direct link copied to clipboard")
      setTimeout(() => setCopied(false), 2400)
    } catch {
      showToast("Unable to copy link")
    }
  }

  // Native share sheet handler
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} | XINVORA`,
          text: shareText,
          url: getProductUrl(),
        })
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  // Social share triggers
  const handleWhatsAppShare = () => {
    const url = getProductUrl()
    const text = encodeURIComponent(`${shareText}\n\n${url}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer")
  }

  const handleInstagramShare = async () => {
    const url = getProductUrl()
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`)
      setCopied(true)
      showToast("Link & details copied for Instagram Story / DM")
      setTimeout(() => setCopied(false), 2400)
    } catch {
      // Fallback
    }
    // Attempt to open Instagram
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer")
  }

  const handleTikTokShare = async () => {
    const url = getProductUrl()
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`)
      setCopied(true)
      showToast("Link copied for TikTok lookbook")
      setTimeout(() => setCopied(false), 2400)
    } catch {
      // Fallback
    }
    window.open("https://www.tiktok.com/", "_blank", "noopener,noreferrer")
  }

  const handlePinterestShare = () => {
    const url = encodeURIComponent(getProductUrl())
    const media = imageUrl ? encodeURIComponent(imageUrl) : ""
    const desc = encodeURIComponent(shareText)
    window.open(
      `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${desc}`,
      "_blank",
      "noopener,noreferrer,width=750,height=600"
    )
  }

  const handleXShare = () => {
    const url = encodeURIComponent(getProductUrl())
    const text = encodeURIComponent(shareText)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer")
  }

  const handleFacebookShare = () => {
    const url = encodeURIComponent(getProductUrl())
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer")
  }

  const handleEmailShare = () => {
    const url = getProductUrl()
    const subject = encodeURIComponent(`${productName} | XINVORA`)
    const body = encodeURIComponent(`${shareText}\n\nExplore this piece at: ${url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self")
  }

  // Trigger button rendering based on variant
  const renderTrigger = () => {
    if (variant === "header") {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-text-secondary hover:text-text-primary transition-all duration-200 group cursor-pointer select-none py-1 px-1.5 rounded-xs hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 ${className}`}
          aria-label={`Share ${productName}`}
          title="Share this piece"
        >
          <Share2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110 duration-200" />
          <span className="relative">
            Share
            <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-text-primary transition-all duration-200 group-hover:w-full" />
          </span>
        </button>
      )
    }

    if (variant === "pill") {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`h-11 px-5 border border-border/80 hover:border-text-primary text-text-primary text-[11px] font-bold uppercase tracking-[0.18em] rounded-full inline-flex items-center justify-center gap-2 hover:bg-surface-elevated transition-all duration-200 cursor-pointer select-none ${className}`}
          aria-label={`Share ${productName}`}
        >
          <Share2 className="w-4 h-4" />
          <span>Share Piece</span>
        </button>
      )
    }

    if (variant === "icon") {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-11 h-11 border border-border/70 hover:border-text-primary text-text-primary rounded-full inline-flex items-center justify-center hover:bg-surface-elevated transition-all duration-200 cursor-pointer select-none ${className}`}
          aria-label={`Share ${productName}`}
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )
    }

    // Default inline
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none ${className}`}
        aria-label={`Share ${productName}`}
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Share</span>
      </button>
    )
  }

  return (
    <>
      {renderTrigger()}

      {/* ── Luxury Share Modal Dialog ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative bg-background text-text-primary border border-border max-w-lg w-full rounded-t-2xl sm:rounded-xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col gap-6 transform transition-all animate-in fade-in slide-in-from-bottom-6 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/40 pb-4">
              <div className="flex flex-col gap-1 pr-6">
                <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.3em] text-accent uppercase select-none">
                  <Sparkles className="w-3 h-3" />
                  <span>Curated Share</span>
                </div>
                <h2
                  id="share-modal-title"
                  className="text-lg sm:text-xl font-display font-light uppercase tracking-wide text-text-primary leading-snug line-clamp-1"
                >
                  {productName}
                </h2>
                <p className="text-body-xs text-text-secondary font-sans font-light">
                  Share this exclusive silhouette across your favorite channels.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close share dialogue"
                className="p-2 -mr-2 -mt-1 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-surface-elevated select-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product Snapshot Preview Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-secondary border border-border/50 select-none">
              {imageUrl ? (
                <div className="relative w-14 h-16 rounded-xs overflow-hidden bg-neutral-100 shrink-0 border border-border/30">
                  <Image
                    src={optimizeCloudinaryUrl(imageUrl, { width: 120 })}
                    alt={productName}
                    fill
                    className="object-cover object-top"
                    sizes="56px"
                  />
                </div>
              ) : null}
              <div className="flex flex-col min-w-0 flex-1">
                {categoryName && (
                  <span className="text-[9px] font-bold tracking-widest text-accent uppercase truncate">
                    {categoryName}
                  </span>
                )}
                <span className="text-xs font-semibold text-text-primary truncate font-sans">
                  {productName}
                </span>
                <span className="text-[11px] text-text-secondary truncate mt-0.5">
                  xinvora.com
                </span>
              </div>
            </div>

            {/* Social Share Grid */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-[0.25em] text-text-secondary uppercase select-none">
                Select Platform
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-emerald-500/50 bg-background hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-left transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <WhatsAppIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-text-primary tracking-wide">WhatsApp</span>
                    <span className="text-[10px] text-text-secondary truncate">Send chat</span>
                  </div>
                </button>

                {/* Instagram */}
                <button
                  type="button"
                  onClick={handleInstagramShare}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-pink-500/50 bg-background hover:bg-pink-50/40 dark:hover:bg-pink-950/20 text-left transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-purple-500/15 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-text-primary tracking-wide">Instagram</span>
                    <span className="text-[10px] text-text-secondary truncate">Story & DM</span>
                  </div>
                </button>

                {/* TikTok */}
                <button
                  type="button"
                  onClick={handleTikTokShare}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-neutral-700 bg-background hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 text-left transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-900/10 dark:bg-neutral-100/10 text-text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <TikTokIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-text-primary tracking-wide">TikTok</span>
                    <span className="text-[10px] text-text-secondary truncate">Lookbook</span>
                  </div>
                </button>

                {/* Pinterest */}
                <button
                  type="button"
                  onClick={handlePinterestShare}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-red-500/50 bg-background hover:bg-red-50/40 dark:hover:bg-red-950/20 text-left transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <PinterestIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-text-primary tracking-wide">Pinterest</span>
                    <span className="text-[10px] text-text-secondary truncate">Pin board</span>
                  </div>
                </button>

                {/* X / Twitter */}
                <button
                  type="button"
                  onClick={handleXShare}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-neutral-700 bg-background hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 text-left transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-900/10 dark:bg-neutral-100/10 text-text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <XTwitterIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-text-primary tracking-wide">X</span>
                    <span className="text-[10px] text-text-secondary truncate">Post look</span>
                  </div>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleFacebookShare}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-blue-500/50 bg-background hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-left transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FacebookIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-text-primary tracking-wide">Facebook</span>
                    <span className="text-[10px] text-text-secondary truncate">Share post</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Actions & Direct Copy */}
            <div className="flex flex-col gap-3 pt-1 border-t border-border/40">
              <span className="text-[10px] font-bold tracking-[0.25em] text-text-secondary uppercase select-none">
                Copy Link or Send
              </span>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={getProductUrl()}
                    className="w-full h-11 px-3 text-xs bg-surface-secondary border border-border/80 rounded-sm text-text-secondary focus:outline-none focus:border-text-primary font-mono truncate select-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`h-11 px-4 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200 inline-flex items-center justify-center gap-1.5 shrink-0 ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-text-primary text-background hover:opacity-90 active:scale-95"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary options: Native share or Email */}
              <div className="flex items-center gap-2 pt-1">
                {canNativeShare && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="flex-1 h-10 border border-border/80 hover:border-text-primary rounded-sm text-[11px] font-bold tracking-wider uppercase text-text-primary hover:bg-surface-elevated transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>More Share Options</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleEmailShare}
                  className="flex-1 h-10 border border-border/80 hover:border-text-primary rounded-sm text-[11px] font-bold tracking-wider uppercase text-text-primary hover:bg-surface-elevated transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Email Link</span>
                </button>
              </div>
            </div>

            {/* Toast Notification Alert */}
            {toastMessage && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-text-primary text-background px-4 py-2 rounded-full text-xs font-medium tracking-wide shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-10 select-none">
                <Check className="w-3.5 h-3.5 text-accent" />
                <span>{toastMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
