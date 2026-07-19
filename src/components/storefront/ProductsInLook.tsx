"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LookProductCard } from "./LookProductCard"

interface ProductsInLookProps {
  products: any[]
  title?: string
}

export function ProductsInLook({ products, title = "Products in This Look" }: ProductsInLookProps) {
  if (!products || products.length === 0) return null

  const [startIndex, setStartIndex] = React.useState(0)
  const [direction, setDirection] = React.useState<1 | -1>(1)

  // How many cards to show per viewport breakpoint (default 4, fewer on narrow)
  const visibleCount = Math.min(products.length, 4)

  const canGoPrev = startIndex > 0
  const canGoNext = startIndex + visibleCount < products.length

  const handleNext = () => {
    if (!canGoNext) return
    setDirection(1)
    setStartIndex((prev) => Math.min(prev + 1, products.length - visibleCount))
  }

  const handlePrev = () => {
    if (!canGoPrev) return
    setDirection(-1)
    setStartIndex((prev) => Math.max(prev - 1, 0))
  }

  const visibleProducts = products.slice(startIndex, startIndex + visibleCount)

  return (
    <section className="w-full py-16 border-t border-border/20 bg-background">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8 px-0">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-[0.35em] text-accent uppercase select-none">
            Complete the Look
          </span>
          <h2 className="text-[1.25rem] font-display font-light text-text-primary uppercase tracking-[0.15em] leading-none">
            {title}
          </h2>
        </div>

        {/* Nav Arrows */}
        {products.length > visibleCount && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              aria-label="Previous pairings"
              className="p-2.5 border border-border/60 text-text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:border-text-primary hover:bg-text-primary hover:text-surface transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              aria-label="Next pairings"
              className="p-2.5 border border-border/60 text-text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:border-text-primary hover:bg-text-primary hover:text-surface transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cards Grid with slide animation */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={startIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6"
          >
            {visibleProducts.map((product) => (
              <LookProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      {products.length > visibleCount && (
        <div className="flex justify-center gap-1.5 mt-8">
          {Array.from({ length: products.length - visibleCount + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > startIndex ? 1 : -1)
                setStartIndex(i)
              }}
              aria-label={`Go to group ${i + 1}`}
              className={`h-px transition-all duration-300 cursor-pointer ${
                i === startIndex ? "w-8 bg-text-primary" : "w-3 bg-border hover:bg-text-secondary"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
