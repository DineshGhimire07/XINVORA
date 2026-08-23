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
  const [activeIndex, setActiveIndex] = React.useState(0)
  const activeIndexRef = React.useRef(0)
  const rafIdRef = React.useRef<number | null>(null)

  // Synchronize active dot from scroll position with passive rAF debounce
  const handleScroll = React.useCallback(() => {
    if (!containerRef.current) return

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return
      const container = containerRef.current
      const slideWidth = container.clientWidth
      if (slideWidth <= 0) return

      const scrollLeft = container.scrollLeft
      const newIndex = Math.max(
        0,
        Math.min(images.length - 1, Math.round(scrollLeft / slideWidth))
      )

      if (newIndex !== activeIndexRef.current) {
        activeIndexRef.current = newIndex
        setActiveIndex(newIndex)
      }
    })
  }, [images.length])

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", handleScroll)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [handleScroll])

  // Reset back to front image (index 0) whenever product leaves the viewport
  React.useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        // When card is scrolled completely out of view, silently reset to first image
        if (!entry.isIntersecting) {
          if (el.scrollLeft !== 0) {
            el.scrollLeft = 0
          }
          if (activeIndexRef.current !== 0) {
            activeIndexRef.current = 0
            setActiveIndex(0)
          }
        }
      },
      { threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 100% Native, zero-jank horizontal swipe container prioritizing vertical scroll */}
      <div
        ref={containerRef}
        className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory touch-pan-y overscroll-x-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {images.map((img, i) => (
          <div key={i} className="relative w-full h-full shrink-0 snap-center snap-always">
            <Link
              href={`/products/${productSlug}`}
              className="absolute inset-0 z-10"
              aria-label={`${productName} view ${i + 1}`}
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
            />
          </div>
        ))}
      </div>

      {/* Real-time Synchronized Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none">
        {images.map((_, i) => (
          <div
            key={i}
            className={`transition-all duration-300 rounded-full ${
              i === activeIndex
                ? "w-3 h-1.5 bg-white shadow-sm"
                : "w-1.5 h-1.5 bg-white/60 shadow-sm"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
