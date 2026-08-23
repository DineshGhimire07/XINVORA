"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { optimizeCloudinaryUrl, SHIMMER_BLUR_DATA_URL } from "@/lib/image-optimizer"

export interface ProductImageRevealProps {
  productId: string
  productSlug: string
  productName: string
  images: { url: string; altText: string | null }[]
  priority?: boolean
  /** Whether to show the pill-dot indicators. Default true. Pass false to hide them. */
  showDots?: boolean
}

export function ProductImageReveal({
  productId: _productId,
  productSlug,
  productName,
  images,
  priority = false,
  showDots = true,
}: ProductImageRevealProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dotsContainerRef = React.useRef<HTMLDivElement>(null)
  const activeIndexRef = React.useRef(0)

  // Direct DOM dot class updater — zero React re-renders
  const updateDots = React.useCallback((newIndex: number) => {
    if (!dotsContainerRef.current) return
    const dots = dotsContainerRef.current.children
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i] as HTMLElement
      dot.className =
        i === newIndex
          ? "w-3 h-1.5 bg-white shadow-sm transition-all duration-300 rounded-full"
          : "w-1.5 h-1.5 bg-white/60 shadow-sm transition-all duration-300 rounded-full"
    }
  }, [])

  // Dot sync via passive rAF scroll listener on the scroll track
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let rafId: number | null = null
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!el) return
        const slideWidth = el.clientWidth
        if (slideWidth <= 0) return
        const newIndex = Math.max(0, Math.min(images.length - 1, Math.round(el.scrollLeft / slideWidth)))
        if (newIndex !== activeIndexRef.current) {
          activeIndexRef.current = newIndex
          updateDots(newIndex)
        }
      })
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [images.length, updateDots])

  const resetToStart = React.useCallback(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollLeft = 0
    activeIndexRef.current = 0
    updateDots(0)
  }, [updateDots])

  // Reset when card is FULLY off-screen — observe the parent [data-product-card]
  React.useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === "undefined") return

    const cardEl = el.closest("[data-product-card]") as Element | null
    const target = cardEl ?? el

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Only reset when completely invisible AND we're not already on image 0
        if (!entry.isIntersecting && activeIndexRef.current !== 0) {
          resetToStart()
        }
      },
      { threshold: 0 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [resetToStart])

  return (
    // Outer wrapper: touch-action pan-y lets vertical page scrolling pass through
    <div className="relative w-full h-full overflow-hidden select-none" style={{ touchAction: "pan-y" }}>
      {/*
        Scroll track: NO touchAction override.
        The browser detects horizontal swipes on this element naturally via overflow-x scroll.
        Do NOT set -webkit-overflow-scrolling: touch — it is deprecated and causes
        momentum scroll conflicts with vertical page scroll on modern iOS.
      */}
      <div
        ref={containerRef}
        className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-x-contain"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="relative shrink-0 snap-center snap-always"
            style={{ minWidth: "100%", width: "100%", height: "100%" }}
          >
            <Link
              href={`/products/${productSlug}`}
              className="absolute inset-0 z-10 block w-full h-full"
              aria-label={`${productName} view ${i + 1}`}
              draggable={false}
            />
            <Image
              src={optimizeCloudinaryUrl(img.url, { width: 640 })}
              alt={img.altText || `${productName} view ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              priority={priority && i === 0}
              fetchPriority={priority && i === 0 ? "high" : "auto"}
              loading={priority && i === 0 ? "eager" : "lazy"}
              decoding="async"
              placeholder="blur"
              blurDataURL={SHIMMER_BLUR_DATA_URL}
              className="object-cover object-top pointer-events-none select-none"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators — only rendered when showDots=true */}
      {showDots && (
        <div
          ref={dotsContainerRef}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none"
        >
          {images.map((_, i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full ${
                i === 0 ? "w-3 h-1.5 bg-white shadow-sm" : "w-1.5 h-1.5 bg-white/60 shadow-sm"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
