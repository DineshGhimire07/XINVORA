"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { AddToCartButton } from "@/features/cart/components/AddToCartButton"

interface BagProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: number | null
  imageUrl: string
  variantId: string
  sku: string
  quantity: number
}

interface BagsSplitCanvasProps {
  products: BagProduct[]
}

export function BagsSplitCanvas({ products }: BagsSplitCanvasProps) {
  // Track currently active product for the left-side spotlight
  const [activeProduct, setActiveProduct] = useState<BagProduct>(products[0] || null)
  
  // Track open detail drawers for products
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)

  const activeImage = useMemo(() => {
    return activeProduct?.imageUrl || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800"
  }, [activeProduct])

  const activeIndex = useMemo(() => {
    if (!activeProduct) return 1
    const idx = products.findIndex((p) => p.id === activeProduct.id)
    return idx !== -1 ? idx + 1 : 1
  }, [activeProduct, products])

  const toggleExpand = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId)
  }

  // Define hardcoded craftsmanship details for the bags to look highly editorial
  const bagSpecs = useMemo(() => {
    return {
      "trapeze-tote": {
        material: "100% full-grain calfskin leather",
        dimensions: "38cm W x 28cm H x 16cm D",
        hardware: "matte black stainless steel",
        interior: "raw suede lining, single zip pocket",
      },
      "editorial-sling": {
        material: "vegetable-tanned smooth leather",
        dimensions: "26cm W x 18cm H x 8cm D",
        hardware: "brushed brass clasp lock",
        interior: "organic cotton canvas lining, double pockets",
      },
      "overnight-duffel": {
        material: "pebbled full-grain cowhide leather",
        dimensions: "52cm W x 32cm H x 22cm D",
        hardware: "heavy-duty antiqued brass zippers",
        interior: "water-resistant nylon, laptop compartment",
      }
    } as Record<string, { material: string; dimensions: string; hardware: string; interior: string }>
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] w-full lg:h-[calc(100vh-6rem)] overflow-hidden bg-background">
      {/* LEFT COLUMN: Sticky Immersive Editorial Canvas */}
      <div className="relative w-full h-[65vh] lg:h-full bg-neutral-50 overflow-hidden select-none lg:border-r border-border/10">
        {/* Editorial Spot Image with Cross-fade transition */}
        <div className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out">
          <Image
            src={activeImage}
            alt={activeProduct?.name || "Luxury Bag Detail"}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
            className="object-cover object-center w-full h-full transition-transform duration-1000 scale-100 hover:scale-102"
          />
        </div>

        {/* Ambient Dark Gradient overlay for editorial text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

        {/* Dynamic Editorial Text overlay */}
        <div className="absolute bottom-10 left-10 right-10 z-10 text-white flex flex-col gap-3 max-w-[32rem]">
          <span className="text-[9px] font-bold tracking-[0.3em] text-white/70 uppercase">
            Object & Permanence
          </span>
          <h2 className="text-[2.2rem] font-display font-extralight leading-none tracking-tight uppercase">
            {activeProduct?.name || "The Bags Collection"}
          </h2>
          <p className="text-[13px] text-white/60 font-light leading-relaxed text-pretty">
            {activeProduct?.description || "Meticulously formed objects crafted to shape around daily ritual, aging beautifully."}
          </p>
        </div>

        {/* Top-Right Page indicator (e.g. 01 / 03) */}
        <div className="absolute top-10 right-10 z-10 text-white font-mono text-[11px] tracking-[0.2em] font-light flex items-center gap-3">
          <span>{activeIndex.toString().padStart(2, "0")}</span>
          <div className="w-10 h-[1px] bg-white/30 relative">
            <div 
              className="absolute left-0 top-0 h-full bg-white transition-all duration-500 ease-out" 
              style={{ width: `${(activeIndex / Math.max(products.length, 1)) * 100}%` }}
            />
          </div>
          <span className="opacity-50">{products.length.toString().padStart(2, "0")}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Independently scrollable asymmetric catalog grid */}
      <div className="w-full lg:h-full lg:overflow-y-auto scrollbar-none px-6 md:px-12 lg:px-16 py-12 lg:py-20 flex flex-col gap-20 bg-white">
        {/* Editorial Eyebrow */}
        <div className="flex flex-col gap-4 border-b border-border/10 pb-8">
          <span className="text-[9px] font-bold tracking-[0.3em] text-accent uppercase">
            Designed for everyday permanence
          </span>
          <h1 className="text-display-sm font-display font-light uppercase tracking-tight text-text-primary">
            The Bags Edit
          </h1>
          <p className="text-body-sm text-text-secondary max-w-sm leading-relaxed font-light">
            An exploration of architectural silhouette, leather weight, and tactile texture. Restructured for minimal weight, maximal form.
          </p>
        </div>

        {/* Asymmetric Product Cards List */}
        <div className="flex flex-col gap-24">
          {products.map((product, index) => {
            const isHovered = activeProduct?.id === product.id
            const isExpanded = expandedProductId === product.id
            const formattedPrice = product.price ? `NPR ${Math.round(product.price / 100).toLocaleString()}` : "NPR 95,000"
            const specs = bagSpecs[product.slug]

            // Apply different alignment classes based on index to create an asymmetric layout
            let alignmentClass = "max-w-[90%] mr-auto" // Default left
            if (index % 3 === 1) {
              alignmentClass = "max-w-[90%] ml-auto" // Right offset
            } else if (index % 3 === 2) {
              alignmentClass = "max-w-full mx-auto" // Centered full width
            }

            return (
              <div
                key={product.id}
                onMouseEnter={() => setActiveProduct(product)}
                className={`flex flex-col gap-5 transition-all duration-500 w-full ${alignmentClass}`}
              >
                {/* Large visual product container */}
                <Link 
                  href={`/products/${product.slug}`} 
                  className="relative block w-full aspect-[4/5] bg-neutral-50 overflow-hidden cursor-pointer border border-border/5"
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    className="object-cover object-center w-full h-full transition-transform duration-1000 scale-100 hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>

                {/* Info block */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-baseline">
                    <Link href={`/products/${product.slug}`} className="hover:opacity-60 transition-opacity">
                      <h3 className="text-[14px] font-sans font-light uppercase tracking-[0.15em] text-text-primary">
                        {product.name.toLowerCase()}
                      </h3>
                    </Link>
                    <span className="text-[13px] font-medium text-text-primary">
                      {formattedPrice}
                    </span>
                  </div>

                  {/* Sizing & details Toggle drawer */}
                  <div className="border-t border-b border-border/10 py-3 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[9px] font-bold tracking-[0.2em] text-text-secondary uppercase select-none">
                      <button
                        type="button"
                        onClick={() => toggleExpand(product.id)}
                        className="hover:text-text-primary transition-colors flex items-center gap-1.5"
                      >
                        {isExpanded ? "Hide Specifications —" : "View Specifications +"}
                      </button>
                      <span className="text-[8px] px-1.5 py-0.5 border border-border/20 rounded-full font-sans tracking-widest text-emerald-600 bg-emerald-50/50">
                        In Stock
                      </span>
                    </div>

                    {isExpanded && specs && (
                      <div className="text-[12px] text-text-secondary font-light leading-relaxed py-2 animate-slide-down flex flex-col gap-2">
                        <p className="text-body-xs italic text-text-secondary/80 mb-2 leading-relaxed">{product.description}</p>
                        <table className="w-full border-collapse font-sans text-left text-[11px] text-text-secondary">
                          <tbody>
                            <tr className="border-b border-border/5">
                              <td className="py-1.5 font-medium text-text-primary w-24 uppercase tracking-wider">material</td>
                              <td className="py-1.5 font-light">{specs.material}</td>
                            </tr>
                            <tr className="border-b border-border/5">
                              <td className="py-1.5 font-medium text-text-primary w-24 uppercase tracking-wider">dimensions</td>
                              <td className="py-1.5 font-light">{specs.dimensions}</td>
                            </tr>
                            <tr className="border-b border-border/5">
                              <td className="py-1.5 font-medium text-text-primary w-24 uppercase tracking-wider">hardware</td>
                              <td className="py-1.5 font-light">{specs.hardware}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 font-medium text-text-primary w-24 uppercase tracking-wider">interior</td>
                              <td className="py-1.5 font-light">{specs.interior}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Direct Add to Bag button drawer with custom styling overrides */}
                  <div className="w-full mt-1 [&_button]:rounded-none [&_button]:bg-transparent [&_button]:border [&_button]:border-text-primary [&_button]:text-text-primary [&_button]:hover:bg-text-primary [&_button]:hover:text-white [&_button]:transition-all [&_button]:duration-300 [&_button]:text-[11px] [&_button]:tracking-[0.2em] [&_button]:uppercase [&_button]:py-3.5 [&_button]:h-auto [&_button]:font-medium">
                    <AddToCartButton variantId={product.variantId} inStock={product.quantity > 0} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state safeguard */}
        {products.length === 0 && (
          <p className="text-body-sm text-text-secondary text-center p-8 border border-dashed border-border/60">
            No bag objects currently available.
          </p>
        )}
      </div>
    </div>
  )
}
