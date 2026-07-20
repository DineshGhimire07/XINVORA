"use client"

/**
 * ProductEditorialPair.tsx — XINVORA PDP Editorial Duo
 * Two images side-by-side below the main gallery, in the same left column.
 * Uses product images [1] and [2] (secondary editorial shots).
 * Fades in + translates up on scroll into view (IntersectionObserver).
 * No text, captions, overlays, or additional containers — pure image storytelling.
 */

import { useEffect, useRef } from "react"
import Image from "next/image"

interface ProductEditorialPairProps {
  images: { url: string; altText: string | null; position: number }[]
  productName: string
}

export function ProductEditorialPair({ images, productName }: ProductEditorialPairProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Scroll-triggered fade-in + slide-up
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Need at least 6 images; use [5] and [6] (photos 6 and 7)
  if (!images || images.length < 6) return null

  const leftImage  = images[5]
  const rightImage = images[6] ?? null

  // Need both images, and they must be distinct
  if (!rightImage || leftImage.url === rightImage.url) return null

  return (
    <div
      ref={ref}
      className="hidden sm:grid grid-cols-2 gap-5 mt-6"
      style={{
        opacity: 0,
        transform: "translateY(20px)",
        transition: "opacity 400ms ease-out, transform 400ms ease-out",
      }}
    >
      {[leftImage, rightImage].map((img, i) => (
        <div
          key={i}
          className="
            relative aspect-[3/4] overflow-hidden
            rounded-sm bg-surface
            cursor-zoom-in
          "
        >
          <Image
            src={img.url}
            alt={
              img.altText ||
              `${productName} editorial ${i === 0 ? "front" : "alternate"} view`
            }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 28vw"
            className="object-cover object-top transition-opacity duration-700 ease-out"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
