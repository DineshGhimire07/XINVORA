"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { LookProductCard } from "./LookProductCard"

interface LookbookSlide {
  id: string
  imageUrl: string
  linkedProductId?: string | null
  linkedProductIds?: string[]
  altText: string
  isActive: boolean
}

interface Props {
  slides: LookbookSlide[]
  products: any[]
  compact?: boolean
  initialSlideId?: string
  isDetailPage?: boolean
}

const EASE = "cubic-bezier(0.25, 1, 0.5, 1)"
const DURATION = "0.5s"

export function ShopTheLookCarousel({ 
  slides = [], 
  products = [], 
  compact = false,
  initialSlideId,
  isDetailPage = false
}: Props) {
  const router = useRouter()
  const active = slides.filter((s) => s.isActive && s.imageUrl)
  if (active.length === 0) return null

  const n = active.length
  // Triple for infinite loop (only when >1 slide)
  const track = n > 1 ? [...active, ...active, ...active] : active
  const mid = n > 1 ? n : 0

  // Initialize active index based on initialSlideId if provided
  const [idx, setIdx] = React.useState(() => {
    if (initialSlideId && active.length > 0) {
      const foundIdx = active.findIndex((s) => s.id === initialSlideId)
      if (foundIdx >= 0) {
        return mid + foundIdx
      }
    }
    return mid
  })

  const [transit, setTransit] = React.useState(true)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = React.useState(0)
  const jumping = React.useRef(false)

  // Measure container width dynamically
  React.useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setContainerW(el.offsetWidth))
    ro.observe(el)
    setContainerW(el.offsetWidth)
    return () => ro.disconnect()
  }, [])

  // ── Sizing Specifications ──
  const isMobile = containerW > 0 && containerW < 768

  // Base dimensions optimized for homepage vs compact PDP
  let baseW = 200
  let baseH = 400
  let gap = 28

  if (compact) {
    baseW = isMobile ? 110 : 130
    baseH = isMobile ? 220 : 260
    gap = isMobile ? 10 : 16
  } else {
    baseW = isMobile ? 130 : 200
    baseH = isMobile ? 260 : 400
    gap = isMobile ? 12 : 28
  }

  // Uniform scale factors across both desktop and mobile viewports
  // Center (active): 1.5x height (bold & prominent hero)
  // Inner sides: 1.166667x height
  // Outer borders: 0.916667x height
  const scaleCenter = 1.5
  const scaleSide = 1.166667
  const scaleEdge = 0.916667

  const centerExp = (baseW * scaleCenter - baseW) / 2
  const sideExp = (baseW * scaleSide - baseW) / 2
  const edgeExp = (baseW * scaleEdge - baseW) / 2

  const shiftInner = centerExp + sideExp
  const shiftOuter = shiftInner + sideExp + edgeExp

  // Calculate visible track width
  const visibleTrackW = (baseW * scaleCenter) + (2 * baseW * scaleSide) + (2 * baseW * scaleEdge) + (4 * gap)
  const trackH = baseH * scaleCenter

  // Center-aligned offset calculation
  const activeContainerW = containerW > 0 ? Math.min(containerW, visibleTrackW) : visibleTrackW
  const trackOffset = activeContainerW / 2 - baseW / 2 - idx * (baseW + gap)

  const go = React.useCallback((newIdx: number) => {
    if (jumping.current) return
    setTransit(true)
    setIdx(newIdx)
  }, [])

  const prev = () => go(idx - 1)
  const next = () => go(idx + 1)

  const onTransitionEnd = React.useCallback(() => {
    if (n <= 1 || jumping.current) return
    const realIdx = ((idx % n) + n) % n
    const midIdx = realIdx + n
    if (idx !== midIdx) {
      jumping.current = true
      setTransit(false)
      setIdx(midIdx)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          jumping.current = false
          setTransit(true)
        })
      )
    }
  }, [idx, n])

  const activeSlideIdx = ((idx % n) + n) % n
  const activeSlide = active[activeSlideIdx]

  // Update URL query path on Looks Detail Page
  React.useEffect(() => {
    if (isDetailPage && activeSlide && typeof window !== "undefined") {
      const newPath = `/looks/${activeSlide.id}`
      if (window.location.pathname !== newPath) {
        window.history.replaceState(null, "", newPath)
      }
    }
  }, [idx, isDetailPage, activeSlide])

  // Swipe controls
  const touchX = React.useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const d = touchX.current - e.changedTouches[0].clientX
    if (d > 50) next()
    else if (d < -50) prev()
    touchX.current = null
  }

  // Handle slide clicks
  const handleSlideClick = (clickIdx: number, slideId: string) => {
    const realClickIdx = ((clickIdx % n) + n) % n
    if (isDetailPage || compact) {
      go(mid + realClickIdx)
    } else {
      router.push(`/looks/${slideId}`)
    }
  }

  const activeProductIds = activeSlide?.linkedProductIds || (activeSlide?.linkedProductId ? [activeSlide.linkedProductId] : [])
  const activeProducts = products.filter((p) => activeProductIds.includes(p.id))
  const showProducts = isDetailPage || compact

  const fmt = (v: number | null) => v == null ? "" : `NPR ${Math.round(v / 100).toLocaleString()}`

  return (
    <section
      id="shop-the-look"
      className="w-full overflow-hidden select-none"
      style={{ 
        paddingTop: compact ? 15 : 30,
        paddingBottom: compact ? 15 : 40,
        background: compact ? "transparent" : "#f7f5f2"
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Section Header ── */}
      {!compact && (
        <div 
          className="mx-auto flex flex-col gap-2 mb-4 px-4 md:px-0"
          style={{ maxWidth: visibleTrackW, width: "100%" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.35em] text-neutral-900 uppercase">
              Shop the Look
            </p>
            <Link
              href="/looks"
              className="hidden md:inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] uppercase text-neutral-900 border-b border-neutral-900 pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors shrink-0"
            >
              View All Looks
            </Link>
          </div>
        </div>
      )}

      {/* ── Sliding Track ── */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={prev}
          aria-label="Previous look"
          className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full bg-white/40 md:bg-white backdrop-blur-xs text-neutral-900 hover:bg-white/80 md:hover:bg-white border border-neutral-200/30 md:border-black/5 hover:shadow-md transition-all cursor-pointer active:scale-90 w-9 h-9 md:w-12 md:h-12"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-black" />
        </button>

        {/* Sliding Area */}
        <div
          ref={containerRef}
          className="overflow-hidden mx-auto relative"
          style={{
            height: trackH,
            width: "100%",
            maxWidth: visibleTrackW,
          }}
        >
          <div
            onTransitionEnd={onTransitionEnd}
            style={{
              display: "flex",
              alignItems: "flex-end",
              height: "100%",
              gap: gap,
              transform: `translateX(${trackOffset}px)`,
              transition: transit ? `transform ${DURATION} ${EASE}` : "none",
              willChange: "transform",
            }}
          >
            {track.map((slide, i) => {
              const distance = i - idx
              const absDist = Math.abs(distance)
              const isActive = distance === 0

              // Determine scale based on distance from center active card
              const sc = isActive 
                ? scaleCenter 
                : absDist === 1 
                  ? scaleSide 
                  : scaleEdge

              // Calculate visual translation shift to preserve gaps perfectly
              let tx = 0
              if (distance > 0) {
                tx = absDist === 1 ? shiftInner : shiftOuter
              } else if (distance < 0) {
                tx = absDist === 1 ? -shiftInner : -shiftOuter
              }

              return (
                <div
                  key={`${i}-${slide.id}`}
                  onClick={() => handleSlideClick(i, slide.id)}
                  className="group relative shrink-0 overflow-hidden bg-neutral-100 block cursor-pointer"
                  style={{
                    width: baseW,
                    height: baseH,
                    transform: `translateX(${tx}px) scale(${sc})`,
                    transformOrigin: "center bottom",
                    transition: transit ? `transform ${DURATION} ${EASE}` : "none",
                    willChange: "transform",
                    zIndex: isActive ? 10 : absDist === 1 ? 5 : 1,
                  }}
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.altText || "Look"}
                    fill
                    sizes={`${baseW}px`}
                    className="object-cover object-top"
                    priority={absDist <= 1}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={next}
          aria-label="Next look"
          className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full bg-white/40 md:bg-white backdrop-blur-xs text-neutral-900 hover:bg-white/80 md:hover:bg-white border border-neutral-200/30 md:border-black/5 hover:shadow-md transition-all cursor-pointer active:scale-90 w-9 h-9 md:w-12 md:h-12"
        >
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-black" />
        </button>
      </div>

      {/* ── Dots (80px below track) ── */}
      {n > 1 && (
        <div className="flex items-center justify-center" style={{ gap: 8, marginTop: compact ? 30 : 50 }}>
          {active.map((_, i) => (
            <button
              key={i}
              onClick={() => go(mid + i)}
              aria-label={`Look ${i + 1}`}
              className="rounded-full cursor-pointer"
              style={{
                width: 8,
                height: 8,
                background: activeSlideIdx === i ? "#171717" : "#d4d4d4",
                transform: activeSlideIdx === i ? "scale(1.25)" : "scale(1)",
                transition: "background 0.3s ease, transform 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* ── PRODUCTS IN THIS LOOK ── */}
      {showProducts && activeSlide && activeProducts.length > 0 && (
        <div className="mt-12 max-w-5xl mx-auto px-8 md:px-20">
          {/* Divider + heading */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex-1 h-px bg-neutral-200" />
            <p className="text-[9px] font-bold tracking-[0.38em] text-neutral-400 uppercase whitespace-nowrap shrink-0">
              Shop this look
            </p>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
            {activeProducts.map((p) => (
              <LookProductCard key={p.id} product={p} compact={isMobile} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile "View All" */}
      {!compact && (
        <div className="flex md:hidden justify-center mt-8">
          <Link href="/looks" className="text-[10px] font-bold tracking-[0.28em] uppercase text-neutral-900 border-b border-neutral-900 pb-0.5">
            View All Looks
          </Link>
        </div>
      )}
    </section>
  )
}
