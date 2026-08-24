"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { optimizeCloudinaryUrl } from "@/lib/image-optimizer"

export interface ProductImageRevealProps {
  productId: string
  productSlug: string
  productName: string
  images: { url: string; altText: string | null }[]
  priority?: boolean
  /** Whether to show the pill-dot indicators. Default true. Pass false to hide them. */
  showDots?: boolean
}

const activeSlideMemory = new Map<string, number>()

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
  const initialIndex = activeSlideMemory.get(productSlug) || 0
  const activeIndexRef = React.useRef(initialIndex)

  // Direct DOM dot class updater — zero React re-renders during swipe
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

  // Restore remembered slide position on mount
  React.useEffect(() => {
    const el = containerRef.current
    if (!el || initialIndex <= 0) return

    const slideWidth = el.clientWidth
    if (slideWidth > 0) {
      el.scrollLeft = initialIndex * slideWidth
      updateDots(initialIndex)
    }
  }, [initialIndex, updateDots])

  // Dot sync via passive rAF scroll listener on the scroll track
  React.useEffect(() => {
    if (!images || images.length <= 1) return
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
          activeSlideMemory.set(productSlug, newIndex)
          updateDots(newIndex)
        }
      })
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [images, productSlug, updateDots])

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div
        ref={containerRef}
        className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {images.map((img, idx) => {
          const isFirst = idx === 0
          return (
            <div
              key={idx}
              className="relative shrink-0 snap-center snap-always"
              style={{ minWidth: "100%", width: "100%", height: "100%" }}
            >
              <Link
                href={idx > 0 ? `/products/${productSlug}?photo=${idx + 1}` : `/products/${productSlug}`}
                className="absolute inset-0 z-10 block w-full h-full"
                aria-label={`${productName} view ${idx + 1}`}
                draggable={false}
              />
              <Image
                src={optimizeCloudinaryUrl(img.url, { width: 640 })}
                alt={img.altText || `${productName} view ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                priority={isFirst && priority}
                fetchPriority={isFirst && priority ? "high" : "auto"}
                loading={isFirst ? "eager" : "lazy"}
                className="object-cover object-top pointer-events-none select-none"
                draggable={false}
              />
            </div>
          )
        })}
      </div>

      {/* Dot indicators — visible when showDots=true and images > 1 */}
      {showDots && images.length > 1 && (
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


