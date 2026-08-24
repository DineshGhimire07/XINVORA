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

export function ProductImageReveal({
  productId: _productId,
  productSlug,
  productName,
  images,
  priority = false,
  showDots = true,
}: ProductImageRevealProps) {
  const [isInteractive, setIsInteractive] = React.useState(false)
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
    if (!isInteractive) return
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
  }, [isInteractive, images.length, updateDots])

  const enableInteractive = React.useCallback(() => {
    if (!isInteractive && images.length > 1) {
      setIsInteractive(true)
    }
  }, [isInteractive, images.length])

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      onTouchStart={enableInteractive}
      onPointerDown={enableInteractive}
    >
      <div
        ref={containerRef}
        className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-x-contain"
        style={{
          touchAction: "pan-x pan-y",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Always render Image 0 for instant initial and swipe-back paint */}
        <div
          className="relative shrink-0 snap-center snap-always"
          style={{ minWidth: "100%", width: "100%", height: "100%" }}
        >
          <Link
            href={`/products/${productSlug}`}
            className="absolute inset-0 z-10 block w-full h-full"
            aria-label={`${productName} view 1`}
            draggable={false}
          />
          <Image
            src={optimizeCloudinaryUrl(images[0]?.url, { width: 640 })}
            alt={images[0]?.altText || `${productName} view 1`}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            priority={priority}
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="object-cover object-top pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* Lazy render additional slides only when user touches/interacts with the card */}
        {isInteractive &&
          images.slice(1).map((img, idx) => {
            const i = idx + 1
            return (
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
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  className="object-cover object-top pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            )
          })}
      </div>

      {/* Dot indicators — always visible when showDots=true and images > 1 */}
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

