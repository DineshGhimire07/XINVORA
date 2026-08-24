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
import { optimizeCloudinaryUrl, SHIMMER_BLUR_DATA_URL } from "@/lib/image-optimizer"

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
    <Section id="featured-collections" padding="none" className="bg-neutral-950 select-none w-full overflow-hidden p-0 m-0 border-0">
      {/* 4-box Editorial Collection Grid - full screen height, zero gap, zero borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 h-[100svh] w-full p-0 m-0 border-0">
        {displayCollections.map((collection: any, index: number) => {
          const hasCover = !!collection.imageUrl || !!collection.imageMobileUrl
          return (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group flex flex-col relative w-full h-full overflow-hidden p-0 m-0 border-0 bg-neutral-950"
            >
              {/* Visual Card Image container */}
              <div className="relative w-full h-full bg-neutral-950 overflow-hidden select-none p-0 m-0 border-0">
                {hasCover ? (
                  <>
                    {collection.imageMobileUrl && (
                      <Image
                        src={optimizeCloudinaryUrl(collection.imageMobileUrl, { width: 800 })}
                        alt={collection.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        priority={index < 2}
                        fetchPriority={index < 2 ? "high" : "auto"}
                        loading={index < 2 ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL={SHIMMER_BLUR_DATA_URL}
                        className="block md:hidden object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                    {collection.imageUrl && (
                      <Image
                        src={optimizeCloudinaryUrl(collection.imageUrl, { width: 1200 })}
                        alt={collection.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        priority={index < 2}
                        fetchPriority={index < 2 ? "high" : "auto"}
                        loading={index < 2 ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL={SHIMMER_BLUR_DATA_URL}
                        className={`${collection.imageMobileUrl ? "hidden md:block" : "block"} object-cover object-top transition-all duration-700 ease-out group-hover:scale-105`}
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-text-secondary uppercase select-none font-semibold">
                    {collection.name}
                  </div>
                )}
                
                {/* Subtle Dark Overlay */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

                {/* Text Overlay Bottom Left */}
                <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 flex items-center justify-between text-white z-10">
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
  // Allow up to 12 items for desktop, first 6 rendered on mobile
  const displayProducts = products.slice(0, 12)

  if (displayProducts.length === 0) return null

  return (
    <Section id="new-arrivals" padding="none" className="bg-background select-none w-full overflow-hidden">
      {/* Title Block Above Grid — Full Width Flush Header */}
      <div className="w-full px-4 sm:px-6 md:px-10 pt-8 md:pt-12 pb-4 md:pb-6 flex flex-col justify-start select-none">
        <span className="text-[10px] md:text-xs font-bold tracking-[0.35em] text-text-secondary uppercase select-none opacity-80 mb-1.5">
          New Season
        </span>
        <h2 className="text-[2rem] sm:text-[2.4rem] md:text-[3rem] font-display font-light text-text-primary tracking-[0.16em] uppercase leading-none whitespace-nowrap">
          New Arrivals
        </h2>
      </div>

      {/* Full-bleed, Zero White Space Product Grid (Edge-to-Edge like Banners)
          - Mobile: 2 columns full bleed, 6 items
          - Tablet: 3 columns full bleed
          - Desktop: 4 to 6 columns full bleed, up to 12 items
          - Gap: 0 (seamless edge-to-edge full screen photos)
      */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
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

          const inStock = (product.variants || []).length > 0
            ? (product.variants || []).some((v: any) => v.inventory ? v.inventory.quantity > 0 : true)
            : false

          // On mobile (< md), only show first 6 items. Items 7-12 are visible on md+
          const isHiddenOnMobile = index >= 6

          return (
            <div key={product.id} className={`w-full ${isHiddenOnMobile ? "hidden md:block" : "block"}`}>
              <ProductCard
                product={product}
                itemColors={itemColors}
                itemSizes={itemSizes}
                priority={index < 4}
                isFirstInGrid={index === 0}
                hideWishlist={true}
                hidePrice={true}
                hideName={true}
                hideDiscountBadge={true}
                overrideImage={product.customImageUrl}
                disableHover={false}
                objectContain={false}
                inStock={inStock}
                hideDots={true}
              />
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function CMSHeroCarousel({ block }: { block: any }) {
  const slides = (block.data?.slides || []).filter(
    (s: any) => s.isActive && (s.imageDesktopUrl || s.imageMobileUrl)
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
  const desktopSrc = currentSlide.imageDesktopUrl || currentSlide.imageMobileUrl
  const mobileSrc = currentSlide.imageMobileUrl || currentSlide.imageDesktopUrl

  return (
    <Section
      id="homepage-hero-carousel"
      padding="none"
      className="relative h-[100svh] w-full flex flex-col bg-background overflow-hidden select-none"
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
              const isZebraImage = desktopSrc?.includes("WA10263P65") || desktopSrc?.includes("16x9");
              const isFirstSlide = currentIndex === 0;
              const optDesktop = desktopSrc ? optimizeCloudinaryUrl(desktopSrc, { width: 2560, quality: "auto:best", dpr: "auto" }) : null;
              const optMobile = mobileSrc ? optimizeCloudinaryUrl(mobileSrc, { width: 1200, quality: "auto:best", dpr: "auto" }) : null;

              return currentSlide.redirectUrl ? (
                <Link href={currentSlide.redirectUrl} className="relative block w-full h-full cursor-pointer overflow-hidden">
                  <div className={isZebraImage ? "hero-crop-container" : "absolute inset-0 w-full h-full"}>
                    {optDesktop && (
                      <Image
                        src={optDesktop}
                        alt={currentSlide.altText || `Hero Slide ${currentIndex + 1}`}
                        fill
                        sizes="100vw"
                        priority={isFirstSlide}
                        fetchPriority={isFirstSlide ? "high" : "auto"}
                        loading={isFirstSlide ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL={SHIMMER_BLUR_DATA_URL}
                        className="hidden md:block object-cover object-center max-w-none w-full h-full"
                      />
                    )}
                    {optMobile && (
                      <Image
                        src={optMobile}
                        alt={currentSlide.altText || `Hero Slide ${currentIndex + 1}`}
                        fill
                        sizes="100vw"
                        priority={isFirstSlide}
                        fetchPriority={isFirstSlide ? "high" : "auto"}
                        loading={isFirstSlide ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL={SHIMMER_BLUR_DATA_URL}
                        className="block md:hidden object-cover object-center max-w-none w-full h-full"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/30 pointer-events-none" />
                </Link>
              ) : (
                <div className="relative w-full h-full overflow-hidden">
                  <div className={isZebraImage ? "hero-crop-container" : "absolute inset-0 w-full h-full"}>
                    {optDesktop && (
                      <Image
                        src={optDesktop}
                        alt={currentSlide.altText || `Hero Slide ${currentIndex + 1}`}
                        fill
                        sizes="100vw"
                        priority={isFirstSlide}
                        fetchPriority={isFirstSlide ? "high" : "auto"}
                        loading={isFirstSlide ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL={SHIMMER_BLUR_DATA_URL}
                        className="hidden md:block object-cover object-center max-w-none w-full h-full"
                      />
                    )}
                    {optMobile && (
                      <Image
                        src={optMobile}
                        alt={currentSlide.altText || `Hero Slide ${currentIndex + 1}`}
                        fill
                        sizes="100vw"
                        priority={isFirstSlide}
                        fetchPriority={isFirstSlide ? "high" : "auto"}
                        loading={isFirstSlide ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL={SHIMMER_BLUR_DATA_URL}
                        className="block md:hidden object-cover object-center max-w-none w-full h-full"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/30 pointer-events-none" />
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>

        {/* Background Preloader for upcoming slides to eliminate slide-transition latency */}
        <div className="hidden" aria-hidden="true">
          {slides.map((s: any, idx: number) => {
            if (idx === currentIndex) return null;
            const d = s.imageDesktopUrl || s.imageUrlDesktop || s.imageUrl;
            const m = s.imageMobileUrl || s.imageUrlMobile || s.imageUrl;
            return (
              <React.Fragment key={idx}>
                {d && <img src={optimizeCloudinaryUrl(d, { width: 2560, quality: "auto:best", dpr: "auto" })} alt="" fetchPriority="low" loading="lazy" />}
                {m && <img src={optimizeCloudinaryUrl(m, { width: 1200, quality: "auto:best", dpr: "auto" })} alt="" fetchPriority="low" loading="lazy" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Manual Arrow Controls (Ultra-Minimalist Subtle Chevrons on Desktop, Zero Background/Borders) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="group/hero-btn hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-24 items-center justify-center text-white/50 hover:text-white transition-all duration-300 cursor-pointer bg-transparent border-0 select-none focus:outline-none"
            aria-label="Previous Slide"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover/hero-btn:-translate-x-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="group/hero-btn hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-24 items-center justify-center text-white/50 hover:text-white transition-all duration-300 cursor-pointer bg-transparent border-0 select-none focus:outline-none"
            aria-label="Next Slide"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover/hero-btn:translate-x-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
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

function parseBannerDimension(val: string | undefined): { styleKey: "aspectRatio" | "height" | "none"; cssValue: string } {
  if (!val || typeof val !== "string") return { styleKey: "none", cssValue: "" }
  const trimmed = val.trim()
  if (!trimmed) return { styleKey: "none", cssValue: "" }

  // Aspect ratio check (e.g. "21/9", "21:9", "16/9", "3/4", "1/1", "4/5", "9/16", "32/10", "2.35/1")
  if (trimmed.includes("/") || trimmed.includes(":")) {
    const ratio = trimmed.replace(":", " / ")
    return { styleKey: "aspectRatio", cssValue: ratio }
  }

  // Pure number e.g. "550" -> "550px"
  if (/^\d+$/.test(trimmed)) {
    return { styleKey: "height", cssValue: `${trimmed}px` }
  }

  // Value with CSS unit (e.g. 500px, 70vh, 80dvh, 35rem)
  return { styleKey: "height", cssValue: trimmed }
}

function CMSBannerBlock({ block }: { block: any }) {
  const data = block.data
  if (!data || data.isActive === false || !data.imageUrl) return null

  // Normalize Desktop Settings
  const desktopSizeMode =
    data.desktopSizeMode || (data.size === "half" ? "50dvh" : data.size === "custom" ? "custom" : "ratio")
  const desktopRatio =
    data.desktopRatio ||
    (data.size === "cinematic"
      ? "21:9"
      : data.size === "landscape"
      ? "16:9"
      : data.size === "classic"
      ? "4:3"
      : data.size === "square"
      ? "1:1"
      : data.size === "portrait"
      ? "3:4"
      : "32:10")
  const desktopFit = data.desktopFit || (data.fit === "contain" ? "contain" : data.fit === "fill" ? "fill" : "cover")
  const desktopFocalPoint =
    data.desktopFocalPoint ||
    (data.position === "object-left"
      ? "left"
      : data.position === "object-right"
      ? "right"
      : data.position?.startsWith("object-") && data.position !== "object-center"
      ? "custom"
      : "center")
  const desktopCustomFocal = data.desktopCustomFocalPoint || data.position?.replace("object-", "") || ""

  // Normalize Mobile Settings
  const mobileSizeMode = data.mobileSizeMode || (data.mobileSize === "custom" ? "custom" : "ratio")
  const mobileRatio =
    data.mobileRatio ||
    (data.mobileSize === "square"
      ? "1:1"
      : data.mobileSize === "story"
      ? "9:16"
      : data.mobileSize === "portrait"
      ? "3:4"
      : "4:5")
  const mobileFit = data.mobileFit || (data.fit === "contain" ? "contain" : data.fit === "fill" ? "fill" : "cover")
  const mobileFocalPoint = data.mobileFocalPoint || "center"
  const mobileCustomFocal = data.mobileCustomFocalPoint || ""

  // Compute Mobile Sizing Class
  let mobileClass = "aspect-[4/5]"
  if (mobileSizeMode === "ratio") {
    if (mobileRatio === "1:1") mobileClass = "aspect-[1/1]"
    else if (mobileRatio === "9:16") mobileClass = "aspect-[9/16]"
    else if (mobileRatio === "3:4") mobileClass = "aspect-[3/4]"
    else if (mobileRatio === "16:9") mobileClass = "aspect-[16/9]"
    else mobileClass = "aspect-[4/5]"
  }

  // Compute Desktop Sizing Class
  let desktopClass = "md:aspect-[32/10]"
  if (desktopSizeMode === "50dvh") {
    desktopClass = "md:h-[50dvh] md:min-h-[350px] md:aspect-auto"
  } else if (desktopSizeMode === "ratio") {
    if (desktopRatio === "21:9") desktopClass = "md:aspect-[21/9] md:h-auto"
    else if (desktopRatio === "16:9") desktopClass = "md:aspect-[16/9] md:h-auto"
    else if (desktopRatio === "4:3") desktopClass = "md:aspect-[4/3] md:h-auto"
    else if (desktopRatio === "1:1") desktopClass = "md:aspect-[1/1] md:h-auto"
    else if (desktopRatio === "3:4") desktopClass = "md:aspect-[3/4] md:h-auto"
    else desktopClass = "md:aspect-[32/10] md:h-auto"
  }

  // Custom Dimensions
  const customDesktop =
    desktopSizeMode === "custom" ? parseBannerDimension(data.desktopCustomSize || data.customDesktopHeight) : null
  const customMobile =
    mobileSizeMode === "custom" ? parseBannerDimension(data.mobileCustomSize || data.customMobileHeight) : null

  // Fit Classes
  const mobileFitClass =
    mobileFit === "contain" ? "object-contain bg-black" : mobileFit === "fill" ? "object-fill" : "object-cover"
  const desktopFitClass =
    desktopFit === "contain"
      ? "md:object-contain md:bg-black"
      : desktopFit === "fill"
      ? "md:object-fill"
      : "md:object-cover"

  // Focal Point Classes
  const mobilePosClass =
    mobileFocalPoint === "left"
      ? "object-left"
      : mobileFocalPoint === "right"
      ? "object-right"
      : mobileFocalPoint === "custom" && mobileCustomFocal
      ? `object-[${mobileCustomFocal}]`
      : "object-center"

  const desktopPosClass =
    desktopFocalPoint === "left"
      ? "md:object-left"
      : desktopFocalPoint === "right"
      ? "md:object-right"
      : desktopFocalPoint === "custom" && desktopCustomFocal
      ? `md:object-[${desktopCustomFocal}]`
      : "md:object-center"

  const containerBaseClass = `relative block w-full overflow-hidden bg-surface ${
    mobileSizeMode !== "custom" ? mobileClass : ""
  } ${desktopSizeMode !== "custom" ? desktopClass : ""}`

  const dynamicId = `banner-block-${block.id}`

  const InnerContent = () => (
    <>
      <picture className="absolute inset-0 block w-full h-full">
        {data.imageMobileUrl && (
          <source
            media="(max-width: 767px)"
            srcSet={optimizeCloudinaryUrl(data.imageMobileUrl, { width: 1080 })}
          />
        )}
        <img
          src={optimizeCloudinaryUrl(data.imageUrl, { width: 1920 })}
          alt={data.title || "Banner"}
          className={`w-full h-full ${mobileFitClass} ${desktopFitClass} ${mobilePosClass} ${desktopPosClass}`}
          loading="lazy"
          decoding="async"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </picture>
      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-500 pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 z-10 text-white max-w-3xl pointer-events-none">
        {data.eyebrow && (
          <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-90 drop-shadow-md">
            {data.eyebrow}
          </span>
        )}
        {data.title && (
          <h2 className="text-4xl md:text-6xl font-display font-light mb-4 drop-shadow-md leading-none uppercase">
            {data.title}
          </h2>
        )}
        {data.tagline && (
          <p className="text-body-sm md:text-body-base opacity-90 max-w-md mb-8 drop-shadow-md font-sans">
            {data.tagline}
          </p>
        )}
        {data.linkText && (
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest group/link pointer-events-auto">
            <span>{data.linkText}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
          </div>
        )}
      </div>
    </>
  )

  return (
    <Section id={dynamicId} padding="none" className="bg-background select-none w-full overflow-hidden">
      {(customMobile || customDesktop) && (
        <style>{`
          #${dynamicId} .banner-inner-box {
            ${
              customMobile?.styleKey === "height"
                ? `height: ${customMobile.cssValue} !important; min-height: ${customMobile.cssValue} !important;`
                : ""
            }
            ${customMobile?.styleKey === "aspectRatio" ? `aspect-ratio: ${customMobile.cssValue} !important;` : ""}
          }
          @media (min-width: 768px) {
            #${dynamicId} .banner-inner-box {
              ${
                customDesktop?.styleKey === "height"
                  ? `height: ${customDesktop.cssValue} !important; min-height: ${customDesktop.cssValue} !important; aspect-ratio: auto !important;`
                  : ""
              }
              ${
                customDesktop?.styleKey === "aspectRatio"
                  ? `aspect-ratio: ${customDesktop.cssValue} !important; height: auto !important; min-height: 0 !important;`
                  : ""
              }
            }
          }
        `}</style>
      )}
      {data.linkUrl ? (
        <Link href={data.linkUrl} className={`group banner-inner-box ${containerBaseClass}`}>
          <InnerContent />
        </Link>
      ) : (
        <div className={`banner-inner-box ${containerBaseClass}`}>
          <InnerContent />
        </div>
      )}
    </Section>
  )
}
