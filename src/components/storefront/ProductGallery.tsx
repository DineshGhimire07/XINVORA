"use client"

import { useState, useRef } from "react"
import Image from "next/image"

interface ProductGalleryProps {
  images: { url: string; altText: string | null; position: number }[]
  productName: string
  badge?: string | null
}

export function ProductGallery({ images, productName, badge }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Desktop: main display capped at first 5 (photos 6 & 7 reserved for editorial pair below)
  // Mobile: swipe gallery contains all images up to 7
  const galleryImages = images && images.length > 0 ? images.slice(0, 7) : []

  if (galleryImages.length === 0) {
    return (
      <div className="relative w-full aspect-[3/4] bg-surface border border-border rounded-sm overflow-hidden select-none flex items-center justify-center">
        <span className="text-body-sm text-text-tertiary">No image available</span>
      </div>
    )
  }

  const activeImage = galleryImages[activeIndex] || galleryImages[0]

  // Exclude the currently active main image from the thumbnails for desktop view
  const otherImages = galleryImages
    .map((img, idx) => ({ img, originalIndex: idx }))
    .filter((item) => item.originalIndex !== activeIndex)

  const desktopThumbnails = otherImages.filter(({ originalIndex }) => originalIndex < 5)

  // Track scroll position on mobile for buttery smooth pagination dot updates
  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return
    const width = container.offsetWidth
    if (width === 0) return
    const index = Math.round(container.scrollLeft / width)
    if (index !== activeIndex && index >= 0 && index < galleryImages.length) {
      setActiveIndex(index)
    }
  }

  return (
    <div className="w-full">
      {/* ── Mobile View: Premium Scroll-Snap Carousel (Clean, Swipe-Only, No Thumbnails) ── */}
      <div className="relative md:hidden w-full aspect-[3/4] bg-surface rounded-sm overflow-hidden select-none">
        {/* Badge overlay */}
        {badge && (
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] uppercase bg-text-primary text-surface select-none">
              {badge}
            </span>
          </div>
        )}

        {/* Native scroll snap layout (fully hardware-accelerated gestures) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {galleryImages.map((img, idx) => (
            <div key={idx} className="relative w-full h-full flex-shrink-0 snap-start">
              <Image
                src={img.url}
                alt={img.altText || `${productName} image ${idx + 1}`}
                fill
                sizes="100vw"
                className="object-cover object-top"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Elegant pagination dots with fluid width animation */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {galleryImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 py-[2px] rounded-full bg-text-primary transition-all duration-300 ease-out ${
                  activeIndex === idx ? "w-4 opacity-100" : "w-1 opacity-30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop View: Main Image + Side Thumbnails (Grid layout) ── */}
      <div className="hidden md:grid grid-cols-5 gap-3 w-full items-stretch">
        {/* Main Image */}
        <div className="relative col-span-4 aspect-[3/4] bg-surface rounded-sm overflow-hidden select-none">
          {badge && (
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <span className="inline-flex items-center px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] uppercase bg-text-primary text-surface select-none">
                {badge}
              </span>
            </div>
          )}

          <Image
            src={activeImage.url}
            alt={activeImage.altText || `${productName} image ${activeIndex + 1}`}
            fill
            sizes="60vw"
            className="object-cover object-top transition-opacity duration-300"
            priority={activeIndex === 0}
            key={activeIndex}
          />
        </div>

        {/* Desktop Vertical Thumbnail Strip */}
        {desktopThumbnails.length > 0 && (
          <div className="grid grid-rows-4 gap-3 h-full">
            {desktopThumbnails.map(({ img, originalIndex }) => (
              <button
                key={originalIndex}
                type="button"
                onClick={() => setActiveIndex(originalIndex)}
                aria-label={`View product image ${originalIndex + 1}`}
                className="relative w-full h-full bg-surface border border-border overflow-hidden rounded-xs cursor-pointer transition-all duration-200 hover:opacity-80 focus:outline-none"
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${productName} thumbnail ${originalIndex + 1}`}
                  fill
                  sizes="(max-width: 1024px) 15vw, 10vw"
                  className="object-cover object-top"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
