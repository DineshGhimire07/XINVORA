"use client"

/**
 * ProductTryOnGuide.tsx — XINVORA PDP Virtual Try-On Guide
 * Conditionally rendered — hidden completely when virtualTryonPrompt is null/empty.
 *
 * BEHAVIOR:
 * - Mobile (<768px): standard in-flow accordion — content pushes elements below it down.
 * - Desktop (≥768px): absolutely-positioned floating overlay — content renders on top
 *   of elements below, no layout shift. Click-outside collapses.
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { useIsMobile } from "@/hooks/use-media-query"

interface ProductTryOnGuideProps {
  virtualTryonPrompt?: string | null
  productName?: string
}

const STEPS = [
  "Screenshot this product's photo from the page",
  "Take or choose a clear photo of yourself",
  "Copy the prompt below",
  "Open your AI tool (ChatGPT, Gemini, etc.) and upload both photos along with the prompt",
]

export function ProductTryOnGuide({ virtualTryonPrompt, productName }: ProductTryOnGuideProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const isMobile = useIsMobile()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Render nothing when no prompt
  if (!virtualTryonPrompt || virtualTryonPrompt.trim() === "") return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(virtualTryonPrompt)
    } catch {
      const el = document.createElement("textarea")
      el.value = virtualTryonPrompt
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Click-outside to collapse — desktop only
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (!isMobile && isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobile, isOpen, handleClickOutside])

  // Expanded panel content — shared between mobile and desktop
  const expandedContent = (
    <div className="flex flex-col gap-4 px-5 pb-5 pt-1">
      {/* Numbered steps */}
      <ol className="flex flex-col gap-2.5">
        {STEPS.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5"
              style={{ backgroundColor: "#9A9087" }}
            >
              {i + 1}
            </span>
            <span className="text-[12px] text-[#3A3530] leading-snug">{step}</span>
          </li>
        ))}
      </ol>

      {/* Prompt display box */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9A9087]">
          Your AI Prompt
        </span>
        <div
          className="w-full rounded-xl px-4 py-3 text-[11px] text-[#3A3530] leading-relaxed overflow-y-auto max-h-32 select-all font-mono"
          style={{ background: "#FAFAF8", border: "1px solid #F2EFEA" }}
        >
          {virtualTryonPrompt}
        </div>
      </div>

      {/* Copy Prompt button */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-200 ease-[ease]"
        style={{
          background: copied ? "#3A3530" : "transparent",
          color: copied ? "#FFFFFF" : "#3A3530",
          border: `1px solid ${copied ? "#3A3530" : "#D5CFC8"}`,
        }}
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
            Copied!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            Copy Prompt
          </>
        )}
      </button>
    </div>
  )

  return (
    // position: relative is the anchor for the absolute desktop panel
    <div ref={wrapperRef} className="relative w-full">
      {/* ── Collapsed card (always in normal flow) ── */}
      <div
        className="w-full bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid #F2EFEA" }}
      >
        {/* Header row — click/tap to toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 cursor-pointer text-left transition-colors duration-200 ease-[ease] hover:bg-[#FAFAF8] active:bg-[#F5F2EE]"
          aria-expanded={isOpen}
        >
          {/* Left: icon + text */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 text-[#9A9087]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" aria-hidden>
                <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" />
                <path d="M5 3L5.7 5.3L8 6L5.7 6.7L5 9L4.3 6.7L2 6L4.3 5.3L5 3Z" />
                <path d="M19 14L19.5 15.8L21 16L19.5 16.2L19 18L18.5 16.2L17 16L18.5 15.8L19 14Z" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] md:text-[12px] font-semibold tracking-[0.06em] text-[#3A3530] leading-tight">
                Try How {productName ? `This ${productName.split(" ")[0]}` : "This Dress"} Looks On You
              </span>
              <span
                className="text-[10px] md:text-[11px] text-[#9A9087] transition-opacity duration-200"
                style={{ opacity: isOpen && isMobile ? 0 : 1 }}
              >
                Tap to see how
              </span>
            </div>
          </div>

          {/* Chevron */}
          <div
            className="flex-shrink-0 text-[#9A9087]/70 transition-transform duration-200 ease-[ease]"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>

        {/* ── MOBILE: in-flow accordion ── */}
        {isMobile && (
          <div
            className="overflow-hidden transition-all duration-[240ms] ease-[ease]"
            style={{
              maxHeight: isOpen ? "600px" : "0px",
              opacity: isOpen ? 1 : 0,
            }}
          >
            <div style={{ borderTop: "1px solid #F2EFEA" }}>
              {expandedContent}
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP: absolute floating overlay ── */}
      {!isMobile && (
        <div
          ref={panelRef}
          className="absolute left-0 right-0 top-full bg-white rounded-2xl"
          style={{
            border: "1px solid #F2EFEA",
            borderTop: "none",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            // fade + slide-down animation
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0)" : "translateY(-8px)",
            pointerEvents: isOpen ? "auto" : "none",
            transition: "opacity 220ms ease, transform 220ms ease",
          }}
        >
          <div style={{ borderTop: "1px solid #F2EFEA" }}>
            {expandedContent}
          </div>
        </div>
      )}
    </div>
  )
}
