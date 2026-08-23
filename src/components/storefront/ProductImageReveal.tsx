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
}

export function ProductImageReveal({
  productId: _productId,
  productSlug,
  productName,
  images,
  priority = false,
}: ProductImageRevealProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dotsContainerRef = React.useRef<HTMLDivElement>(null)
  const activeIndexRef = React.useRef(0)
  const wasOffscreenRef = React.useRef(false)

  // Direct DOM dot class updater - avoids React re-renders during scrolling
  const updateDots = React.useCallback((newIndex: number) => {
    if (!dotsContainerRef.current) return
    const dots = dotsContainerRef.current.children
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i] as HTMLElement
      if (i === newIndex) {
        dot.className = "w-3 h-1.5 bg-white shadow-sm transition-all duration-300 rounded-full"
      } else {
        dot.className = "w-1.5 h-1.5 bg-white/60 shadow-sm transition-all duration-300 rounded-full"
      }
    }
  }, [])

  // Synchronize active dot from scroll position with passive rAF
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
        const newIndex = Math.max(
          0,
          Math.min(images.length - 1, Math.round(el.scrollLeft / slideWidth))
        )
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
    try {
      el.scrollTo({ left: 0 })
    } catch {
      // Ignore
    }
    activeIndexRef.current = 0
    updateDots(0)
  }, [updateDots])

  // Reset back to front image silently when scrolled off-screen and on re-entry
  React.useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            wasOffscreenRef.current = true
            resetToStart()
          } else if (wasOffscreenRef.current) {
            wasOffscreenRef.current = false
            resetToStart()
          }
        })
      },
      { threshold: [0, 0.05] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [resetToStart])

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 100% Native, zero-jank horizontal swipe container prioritizing vertical scroll */}
      <div
        ref={containerRef}
        className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-x-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {images.map((img, i) => (
          <div key={i} className="relative min-w-full w-full h-full shrink-0 snap-center snap-always">
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

      {/* Real-time Synchronized Dot Indicators */}
      <div
        ref={dotsContainerRef}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none"
      >
        {images.map((_, i) => (
          <div
            key={i}
            className={`transition-all duration-300 rounded-full ${
              i === 0
                ? "w-3 h-1.5 bg-white shadow-sm"
                : "w-1.5 h-1.5 bg-white/60 shadow-sm"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
