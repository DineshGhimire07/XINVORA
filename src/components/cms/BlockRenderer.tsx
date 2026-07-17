"use client"

import * as React from "react"
import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import sanitizeHtml from "sanitize-html"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Server-safe HTML sanitizer
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "h1", "h2", "h3", "h4", "h5", "h6",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["class", "id", "style"],
  },
  disallowedTagsMode: "discard",
  allowedSchemes: ["http", "https", "mailto", "tel"],
}

import { ProductCard } from "@/components/storefront/ProductCard"

export function CMSBlockRenderer({ block, products, collections }: { block: any; products?: any[]; collections?: any[] }) {
  if (!block || !block.type) return null

  switch (block.type) {
    case "RICHTEXT": {
      const cleanHTML = sanitizeHtml(block.data.content || "", SANITIZE_OPTIONS)
      return (
        <Section padding="xl" className="bg-background">
          <Container>
            <div
              className="prose prose-neutral max-w-3xl mx-auto text-text-secondary"
              dangerouslySetInnerHTML={{ __html: cleanHTML }}
            />
          </Container>
        </Section>
      )
    }
    case "HERO":
      return <CMSHeroCarousel block={block} />
    case "PRODUCT_GRID":
      return <CMSProductGrid block={block} products={products || block.data?.products} />
    case "COLLECTION_GRID":
      return <CMSCollectionGrid block={block} collections={collections || block.data?.collections} />
    case "BANNER":
      return <CMSBannerBlock block={block} />
    default:
      return (
        <div className="p-8 border border-dashed border-border/40 text-center text-text-secondary text-body-sm">
          Unsupported block type: {block.type}
        </div>
      )
  }
}

function CMSCollectionGrid({ block, collections = [] }: { block: any; collections?: any[] }) {
  const displayCollections = collections.slice(0, 4)

  if (displayCollections.length === 0) return null

  return (
    <Section id="featured-collections" padding="none" className="bg-background select-none">
      {/* 4-box Editorial Collection Grid - full screen height, no gap, full bleed */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 h-[100dvh] w-full">
        {displayCollections.map((collection: any, index: number) => {
          const hasCover = !!collection.imageUrl
          return (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group flex flex-col relative w-full h-full overflow-hidden"
            >
              {/* Visual Card Image container */}
              <div className="relative w-full h-full bg-surface-secondary overflow-hidden select-none">
                {hasCover ? (
                  <Image
                    src={collection.imageUrl}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    priority={index < 2}
                    className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-text-secondary uppercase select-none font-semibold">
                    {collection.name}
                  </div>
                )}
                
                {/* Subtle Dark Overlay */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

                {/* Text Overlay Bottom Left */}
                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-white z-10">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase drop-shadow-md">
                    {collection.name}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300 drop-shadow-md" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}

function CMSProductGrid({ block, products = [] }: { block: any; products?: any[] }) {
  const displayProducts = products.slice(0, 10)

  if (displayProducts.length === 0) return null

  return (
    <Section id="new-arrivals" padding="none" className="bg-background border-b border-border py-24 select-none">
      <Container>
        {/* Title Block Above Grid */}
        <div className="flex flex-col justify-start select-none mb-14">
          <span className="text-[10px] font-bold tracking-[0.4em] text-text-secondary uppercase select-none opacity-80 mb-3 pl-2">
            New Season
          </span>
          <h2 className="text-[2.2rem] md:text-[2.8rem] font-display font-light text-text-primary tracking-[0.2em] uppercase leading-none whitespace-nowrap pl-2">
            New Arrivals
          </h2>
        </div>

        {/* Dynamic 5 columns x 2 rows Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
          {displayProducts.map((product: any, index: number) => {
            const itemColors = Array.from(
              new Map(
                (product.variants || [])
                  .filter((v: any) => v.color)
                  .map((v: any) => [v.color!.id, v.color!])
              ).values()
            ) as any[]

            const itemSizes = Array.from(
              new Map(
                (product.variants || [])
                  .filter((v: any) => v.size)
                  .map((v: any) => [v.size!.id, v.size!])
              ).values()
            ).sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true })) as any[]

            return (
              <ProductCard
                key={product.id}
                product={product}
                itemColors={itemColors}
                itemSizes={itemSizes}
                priority={index < 5}
                isFirstInGrid={index === 0}
                hideWishlist={true}
                hidePrice={true}
                hideName={true}
                overrideImage={product.customImageUrl}
                disableHover={true}
                objectContain={true}
              />
            )
          })}
        </div>
      </Container>
    </Section>
  )
}

function CMSHeroCarousel({ block }: { block: any }) {
  const slides = (block.data?.slides || []).filter(
    (s: any) => s.isActive && s.imageDesktopUrl && s.imageMobileUrl
  )

  if (slides.length === 0) return null

  const [currentIndex, setCurrentIndex] = React.useState(0)
  const touchStartX = React.useRef<number | null>(null)

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const handlePrev = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Auto-advance timer (5.5s)
  React.useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(handleNext, 5500)
    return () => clearInterval(interval)
  }, [handleNext, slides.length])

  // Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX

    if (diff > 50) {
      handleNext()
    } else if (diff < -50) {
      handlePrev()
    }
    touchStartX.current = null
  }

  const currentSlide = slides[currentIndex]

  return (
    <Section
      id="homepage-hero-carousel"
      padding="none"
      className="relative h-[100dvh] w-full flex flex-col bg-background overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Slide Transitions with Framer Motion (Simultaneous Crossfade) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {(() => {
              const isZebraImage = currentSlide.imageDesktopUrl?.includes("WA10263P65") || currentSlide.imageDesktopUrl?.includes("16x9");
              return currentSlide.redirectUrl ? (
                <Link href={currentSlide.redirectUrl} className="relative block w-full h-full cursor-pointer overflow-hidden">
                  <div className={isZebraImage ? "hero-crop-container" : "absolute inset-0 w-full h-full"}>
                    <Image
                      src={currentSlide.imageDesktopUrl}
                      alt={currentSlide.altText || `Hero Slide ${currentIndex + 1}`}
                      fill
                      sizes="100vw"
                      priority={currentIndex === 0}
                      className="hidden md:block object-cover object-center max-w-none w-full h-full"
                    />
                    <Image
                      src={currentSlide.imageMobileUrl}
                      alt={currentSlide.altText || `Hero Slide ${currentIndex + 1}`}
                      fill
                      sizes="100vw"
                      priority={currentIndex === 0}
                      className="block md:hidden object-cover object-center max-w-none w-full h-full"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/30 pointer-events-none" />
                </Link>
              ) : (
                <div className="relative w-full h-full overflow-hidden">
                  <div className={isZebraImage ? "hero-crop-container" : "absolute inset-0 w-full h-full"}>
                    <Image
                      src={currentSlide.imageDesktopUrl}
                      alt={currentSlide.altText || `Hero Slide ${currentIndex + 1}`}
                      fill
                      sizes="100vw"
                      priority={currentIndex === 0}
                      className="hidden md:block object-cover object-center max-w-none w-full h-full"
                    />
                    <Image
                      src={currentSlide.imageMobileUrl}
                      alt={currentSlide.altText || `Hero Slide ${currentIndex + 1}`}
                      fill
                      sizes="100vw"
                      priority={currentIndex === 0}
                      className="block md:hidden object-cover object-center max-w-none w-full h-full"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/30 pointer-events-none" />
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Arrow Controls (only show if multiple slides) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/20 bg-black/10 text-white hover:bg-black/30 hover:border-white/40 transition-all active:scale-95 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/20 bg-black/10 text-white hover:bg-black/30 hover:border-white/40 transition-all active:scale-95 cursor-pointer"
            aria-label="Next Slide"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Indicators (only show if multiple slides) */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {slides.map((_: any, index: number) => {
            const isCurrent = index === currentIndex
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isCurrent ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            )
          })}
        </div>
      )}
    </Section>
  )
}

function CMSBannerBlock({ block }: { block: any }) {
  const data = block.data
  if (!data || data.isActive === false || !data.imageUrl) return null

  return (
    <Section id={`banner-block-${block.id}`} padding="none" className="bg-background select-none w-screen overflow-hidden">
      {data.linkUrl ? (
        <Link href={data.linkUrl} className="group relative block w-full aspect-[3/4] md:aspect-[32/10] overflow-hidden bg-neutral-900">
          <picture className="block w-full h-full">
            {data.imageMobileUrl && (
              <source media="(max-width: 767px)" srcSet={data.imageMobileUrl} />
            )}
            <img
              src={data.imageUrl}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 z-10 text-white max-w-3xl">
            {data.eyebrow && (
              <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-90 drop-shadow-md">
                {data.eyebrow}
              </span>
            )}
            <h2 className="text-4xl md:text-6xl font-display font-light mb-4 drop-shadow-md">
              {data.title}
            </h2>
            {data.tagline && (
              <p className="text-body-sm md:text-body-base opacity-90 max-w-md mb-8 drop-shadow-md">
                {data.tagline}
              </p>
            )}
            {data.linkText && (
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest group/link">
                <span>{data.linkText}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="relative block w-full aspect-[3/4] md:aspect-[32/10] overflow-hidden bg-neutral-900">
          <picture className="block w-full h-full">
            {data.imageMobileUrl && (
              <source media="(max-width: 767px)" srcSet={data.imageMobileUrl} />
            )}
            <img
              src={data.imageUrl}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 z-10 text-white max-w-3xl">
            {data.eyebrow && (
              <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-90 drop-shadow-md">
                {data.eyebrow}
              </span>
            )}
            <h2 className="text-4xl md:text-6xl font-display font-light mb-4 drop-shadow-md">
              {data.title}
            </h2>
            {data.tagline && (
              <p className="text-body-sm md:text-body-base opacity-90 max-w-md drop-shadow-md">
                {data.tagline}
              </p>
            )}
          </div>
        </div>
      )}
    </Section>
  )
}
