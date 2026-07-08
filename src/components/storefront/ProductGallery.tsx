"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ZoomIn } from "lucide-react"

interface ProductGalleryProps {
  images: { url: string; altText: string | null; position: number }[]
  productName: string
  badge?: string | null
}

export function ProductGallery({ images, productName, badge }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Use the actual images array, capped at max 5
  const galleryImages = images && images.length > 0 ? images.slice(0, 5) : [];

  if (galleryImages.length === 0) {
    return (
      <div className="relative w-full aspect-[3/4] bg-surface border border-border rounded-sm overflow-hidden select-none flex items-center justify-center">
        <span className="text-body-sm text-text-tertiary">No image available</span>
      </div>
    )
  }

  const activeImage = galleryImages[activeIndex] || galleryImages[0];

  // Exclude the currently active main image from the thumbnails
  const otherImages = galleryImages
    .map((img, idx) => ({ img, originalIndex: idx }))
    .filter((item) => item.originalIndex !== activeIndex);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 w-full items-stretch">

      {/* ── Main Image (col-span-4 on desktop) ── */}
      <div className="relative md:col-span-4 aspect-[3/4] bg-surface border border-border rounded-sm overflow-hidden select-none">
        <Image
          src={activeImage.url}
          alt={activeImage.altText || `${productName} image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover object-top transition-opacity duration-300"
          priority={activeIndex === 0}
          key={activeIndex} // force re-render on swap for clean transition
        />

        {/* Badge overlay — top-left, only when set */}
        {badge && (
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] uppercase bg-text-primary text-surface select-none">
              {badge}
            </span>
          </div>
        )}

        {/* Zoom icon — bottom-right, visual only (TODO: wire to lightbox) */}
        <button
          type="button"
          aria-label="Zoom image"
          className="absolute bottom-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm text-text-primary hover:bg-white hover:scale-110 transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Mobile pagination dots */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none md:hidden">
            {galleryImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to image ${idx + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
                  activeIndex === idx ? "bg-text-primary w-3" : "bg-text-primary/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Vertical Thumbnail Strip (Desktop Right, Mobile Hidden, col-span-1) ── */}
      {otherImages.length > 0 && (
        <div className="hidden md:grid grid-rows-4 gap-3 h-full">
          {otherImages.map(({ img, originalIndex }) => (
            <button
              key={originalIndex}
              type="button"
              onClick={() => setActiveIndex(originalIndex)}
              aria-label={`View product image ${originalIndex + 1}`}
              className="relative w-full h-full bg-surface border border-border overflow-hidden rounded-xs cursor-pointer transition-all duration-200 hover:border-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
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

      {/* ── Mobile Thumbnail Strip (Below image on mobile) ── */}
      {otherImages.length > 0 && (
        <div className="flex md:hidden gap-2 overflow-x-auto py-1">
          {otherImages.map(({ img, originalIndex }) => (
            <button
              key={originalIndex}
              type="button"
              onClick={() => setActiveIndex(originalIndex)}
              aria-label={`View product image ${originalIndex + 1}`}
              className="relative flex-shrink-0 w-16 aspect-[3/4] bg-surface border border-border overflow-hidden rounded-xs cursor-pointer transition-all duration-200"
            >
              <Image
                src={img.url}
                alt={img.altText || `${productName} thumbnail ${originalIndex + 1}`}
                fill
                sizes="64px"
                className="object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
