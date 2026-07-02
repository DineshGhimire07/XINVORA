/**
 * app/products/[slug]/page.tsx — XINVORA Product Detail Experience Foundation
 *
 * Implements the premium Product Detail Page.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import * as React from "react"
import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/metadata"
import { Breadcrumb } from "@/components/shared/Breadcrumb/Breadcrumb"
import Link from "next/link"

interface ProductDetails {
  id: string
  name: string
  slug: string
  collection: string
  material: string
  description: string
  composition: string
  craft: string
  care: string
  shipping: string
  availability: string
}

const PRODUCTS_DATA: Record<string, ProductDetails> = {
  "linen-draped-coat": {
    id: "x-01",
    name: "Linen Draped Coat",
    slug: "linen-draped-coat",
    collection: "Collection I",
    material: "Organic Linen",
    description: "A spacious draped coat tailored in organic, unstructured flax linen. Features deep side pockets, clean raw-edge borders, and a relaxed, floating drop shoulder for effortless layering.",
    composition: "100% Organic Belgian Linen, unbleached and certified wash-processed.",
    craft: "Hand-cut and assembled in Portugal at a family-owned atelier specializing in structured linen tailoring.",
    care: "Dry clean only, or gentle cold hand wash. Lay flat to dry out of direct sunlight to protect fibres.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Returns accepted within 14 days of receipt.",
    availability: "Made to order",
  },
  "tailored-cropped-jacket": {
    id: "x-02",
    name: "Tailored Cropped Jacket",
    slug: "tailored-cropped-jacket",
    collection: "Collection I",
    material: "Structured Cotton",
    description: "A sculptural cropped jacket cut from heavy structured organic cotton canvas. Finished with minimalist concealed horn buttons and deep turn-back cuffs.",
    composition: "100% Organic heavy cotton canvas, washed for a premium hand-feel.",
    craft: "Crafted with clean interior bound seams in Porto, Portugal.",
    care: "Gentle wash cold, inside out. Do not tumble dry. Warm iron if necessary.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Returns accepted within 14 days of receipt.",
    availability: "Made to order",
  },
  "stoneware-vessel": {
    id: "x-03",
    name: "Stoneware Vessel",
    slug: "stoneware-vessel",
    collection: "Collection II",
    material: "Raw Ceramic",
    description: "A singular stoneware vessel thrown by hand. Features a coarse textured raw exterior with a clear glossy interior glaze, designed to hold water or sit as a sculptural focus.",
    composition: "Iron-bearing raw stoneware clay sourced locally.",
    craft: "Hand-thrown and wood-fired over 36 hours in a traditional kiln in Kyoto, Japan.",
    care: "Wipe with a damp cloth. Hand wash interior with mild soap if holding liquid.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Shipped in wooden protective crate boxes.",
    availability: "Limited edition",
  },
  "oak-console-table": {
    id: "x-04",
    name: "Oak Console Table",
    slug: "oak-console-table",
    collection: "Collection II",
    material: "European Oak",
    description: "A minimalist console table defined by clean lines and joinery details. Made from solid European white oak with a dry matte oil finish to preserve the natural raw oak tone.",
    composition: "100% FSC-certified European White Oak.",
    craft: "Made to order by master joiners in Copenhagen, Denmark, utilizing traditional mortise-and-tenon details.",
    care: "Dust with a dry soft cloth. Clean spills immediately. Avoid placing hot objects directly.",
    shipping: "White-glove home delivery included. Shipped inside custom cardboard crating.",
    availability: "Made to order",
  },
  "leather-zip-case": {
    id: "x-05",
    name: "Leather Zip Case",
    slug: "leather-zip-case",
    collection: "Collection III",
    material: "Full-Grain Leather",
    description: "A minimal utility case crafted in heavy vegetable-tanned leather. Fits document folders or a 14-inch laptop. Finished with a polished solid brass zip.",
    composition: "Vegetable-tanned full-grain cowhide leather, solid brass zipper.",
    craft: "Stitched by hand with waxed linen thread in Tuscany, Italy.",
    care: "Condition annually with premium leather balm. Avoid contact with excessive moisture.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Returns accepted within 14 days of receipt.",
    availability: "Available",
  },
  "brass-incense-holder": {
    id: "x-06",
    name: "Brass Incense Holder",
    slug: "brass-incense-holder",
    collection: "Collection III",
    material: "Solid Brass",
    description: "A heavy, solid brass incense burner with a sand-cast texture. Ages to a rich dark patina over time. Fits standard incense sticks.",
    composition: "100% Solid sand-cast brass.",
    craft: "Cast and finished by hand in Toyama, Japan.",
    care: "Brass will oxidize naturally. Polish occasionally with metal cream if a shiny finish is desired.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Returns accepted within 14 days of receipt.",
    availability: "Available",
  },
  "relaxed-trouser": {
    id: "x-07",
    name: "Relaxed Trouser",
    slug: "relaxed-trouser",
    collection: "Collection I",
    material: "Fibre Linen",
    description: "A fluid, wide-leg trouser cut in washed long-staple flax linen. Features a comfortable elasticated back waist and deep hidden seam pockets.",
    composition: "100% Long-staple flax linen.",
    craft: "Tailored in Portugal at a boutique linen workshop.",
    care: "Gentle cold hand wash or delicate machine wash. Air dry flat.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Returns accepted within 14 days of receipt.",
    availability: "Made to order",
  },
  "structured-overshirt": {
    id: "x-08",
    name: "Structured Overshirt",
    slug: "structured-overshirt",
    collection: "Collection I",
    material: "Raw Canvas",
    description: "A heavy-duty utility overshirt constructed from unbleached organic cotton canvas. Features deep chest patch pockets and premium sustainable wood buttons.",
    composition: "100% Unbleached organic cotton canvas.",
    craft: "Stitched with heavy contrast threads in Porto, Portugal.",
    care: "Wash cold, air dry. The raw canvas will soften and form to your shape with wear.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Returns accepted within 14 days of receipt.",
    availability: "Available",
  },
  "linen-cushion-cover": {
    id: "x-09",
    name: "Linen Cushion Cover",
    slug: "linen-cushion-cover",
    collection: "Collection II",
    material: "Washed Linen",
    description: "A simple cushion cover woven in heavy-weight Belgian linen. The washed finish gives a relaxed, organic texture that softens with wash and age.",
    composition: "100% Belgian washed linen.",
    craft: "Woven on historical looms in Flanders, finished in Ghent.",
    care: "Machine wash warm, air dry. Iron damp for a crisp look, or leave unironed for a raw feel.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Returns accepted within 14 days of receipt.",
    availability: "Available",
  },
  "clay-bowl-set": {
    id: "x-10",
    name: "Clay Bowl Set",
    slug: "clay-bowl-set",
    collection: "Collection II",
    material: "Terracotta",
    description: "A nested set of three bowls thrown in local terracotta clay. Glazed with a lead-free milky glaze on the interior, leaving the raw warm terracotta texture exposed on the outside.",
    composition: "Local terracotta clay, lead-free food-safe glaze.",
    craft: "Wheel-thrown and glazed by hand in Puglia, Italy.",
    care: "Hand wash only. Not recommended for microwave or dishwasher.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Packaged securely with recycled paper grids.",
    availability: "Limited edition",
  },
  "wool-travel-case": {
    id: "x-11",
    name: "Wool Travel Case",
    slug: "wool-travel-case",
    collection: "Collection III",
    material: "Merino Wool",
    description: "A heavy felted merino wool pouch with full-grain leather zipper pulls. Perfect for organizing small travel essentials, cords, or toiletries.",
    composition: "100% Felted merino wool, Italian calf leather details.",
    craft: "Felted and sewn in Munich, Germany.",
    care: "Spot clean only with cold water and mild wool detergent. Lay flat to dry.",
    shipping: "Complimentary carbon-neutral worldwide shipping. Returns accepted within 14 days of receipt.",
    availability: "Available",
  },
  "oak-lounge-chair": {
    id: "x-12",
    name: "Oak Lounge Chair",
    slug: "oak-lounge-chair",
    collection: "Collection III",
    material: "Saddle Leather & Oak",
    description: "A low, relaxed lounge chair featuring a heavy solid oak frame and a thick, vegetable-tanned saddle leather sling seat. Designed to develop a rich golden patina.",
    composition: "FSC-certified solid European Oak, vegetable-tanned saddle leather.",
    craft: "Hand-crafted to order in Copenhagen, Denmark.",
    care: "Treat saddle leather annually with specialized wax. Avoid exposing to direct heat sources.",
    shipping: "White-glove home delivery included. Shipped inside custom crated box.",
    availability: "Made to order",
  },
}

// Fallback product data if slug is not matched
const DEFAULT_PRODUCT: ProductDetails = {
  id: "x-default",
  name: "Edition object",
  slug: "edition-object",
  collection: "Collection I",
  material: "Premium Materials",
  description: "A curated piece designed with absolute intention—bringing quiet refinement and lasting quality to modern living.",
  composition: "Select premium materials chosen for longevity and texture.",
  craft: "Meticulously hand-crafted in collaboration with traditional workshops.",
  care: "Handle with considered care. Clean and store according to traditional guidelines.",
  shipping: "Complimentary carbon-neutral worldwide shipping on all objects.",
  availability: "Made to order",
}

export async function generateStaticParams() {
  return Object.keys(PRODUCTS_DATA).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const product = PRODUCTS_DATA[resolvedParams.slug] || DEFAULT_PRODUCT
  return buildMetadata({
    title: product.name,
    description: product.description,
  })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const product = PRODUCTS_DATA[resolvedParams.slug] || DEFAULT_PRODUCT

  // Define related products list based on the current product
  const relatedSlugs = Object.keys(PRODUCTS_DATA)
    .filter((slug) => slug !== product.slug)
    .slice(0, 4)

  const relatedProducts = relatedSlugs.map((slug) => PRODUCTS_DATA[slug])

  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        {/* 1. Breadcrumbs */}
        <Breadcrumb 
          items={[
            { label: "Collections", href: "/collections" },
            { label: product.collection },
            { label: product.name }
          ]} 
        />

        {/* 2. Product Hero: Split Editorial Layout */}
        <Section id="product-hero" padding="none" className="py-6 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 lg:gap-20 items-start">
            
            {/* ── Left Column: Product Gallery ── */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* Large Hero Image Area */}
              <div className="relative w-full aspect-product bg-surface border border-border rounded-sm overflow-hidden select-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.01]" />
              </div>
              
              {/* Gallery Thumbnails List (Horizontal row of 4 placeholders) */}
              <div className="grid grid-cols-4 gap-3 select-none">
                {[1, 2, 3, 4].map((idx) => (
                  <div 
                    key={idx} 
                    className="aspect-product bg-surface border border-border rounded-xs overflow-hidden cursor-pointer hover:border-text-primary transition-colors duration-200"
                  >
                    <div className="w-full h-full bg-gradient-to-b from-transparent to-black/[0.01]" />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Column: Product Information Panel ── */}
            <div className="md:col-span-5 flex flex-col items-start text-left pt-2">
              <Stack gap={8} className="w-full">
                
                {/* Headers */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                    {product.collection}
                  </span>
                  <h1 className="text-[2.25rem] font-display text-text-primary leading-tight tracking-tight uppercase font-light">
                    {product.name}
                  </h1>
                  <span className="text-body-sm text-text-secondary select-none">
                    {product.material}
                  </span>
                  <div className="pt-2">
                    <span className="inline-flex items-center text-[10px] font-bold tracking-widest text-text-primary uppercase border border-border rounded-xs px-2.5 py-1 bg-surface-elevated select-none">
                      {product.availability}
                    </span>
                  </div>
                </div>

                {/* Separator */}
                <hr className="w-full border-border/40" />

                {/* Editorial Description */}
                <p className="text-body-md text-text-primary leading-relaxed font-light text-pretty">
                  {product.description}
                </p>

                {/* Variant Selectors (Presentation only) */}
                <div className="flex flex-col gap-6 w-full">
                  {/* Colors */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase select-none">
                      Colour
                    </span>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest border border-text-primary text-text-primary rounded-sm select-none">
                        Sand
                      </button>
                      <button className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest border border-border/40 text-text-secondary hover:text-text-primary hover:border-border transition-colors rounded-sm select-none">
                        Black
                      </button>
                      <button className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest border border-border/40 text-text-secondary hover:text-text-primary hover:border-border transition-colors rounded-sm select-none">
                        Stone
                      </button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase select-none">
                      Size
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {["XS", "S", "M", "L", "XL"].map((size, idx) => (
                        <button 
                          key={size}
                          className={`w-11 h-11 flex items-center justify-center text-[11px] font-semibold uppercase border rounded-sm transition-all select-none ${
                            idx === 2 
                              ? "border-text-primary text-text-primary font-bold" 
                              : "border-border/40 text-text-secondary hover:text-text-primary hover:border-border"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 w-full pt-4">
                  <Button variant="primary" size="lg" className="w-full tracking-wider uppercase font-semibold">
                    Add to Bag
                  </Button>
                  <Button variant="outline" size="lg" className="w-full tracking-wider uppercase font-semibold border-border/50 bg-background/10">
                    Save for Later
                  </Button>
                </div>

              </Stack>
            </div>

          </div>
        </Section>

        {/* 3. Product Details: Editorial Accordion Blocks */}
        <Section id="product-details" padding="lg" className="border-t border-border/20 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            
            {/* Title / Eyebrow */}
            <div className="md:col-span-4 select-none">
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                Product Details
              </span>
            </div>

            {/* Typography content detail blocks */}
            <div className="md:col-span-8 flex flex-col gap-10">
              
              {/* Section 1: Materials & Composition */}
              <div className="flex flex-col gap-3 text-left">
                <h2 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Composition & Materials
                </h2>
                <p className="text-body-sm text-text-secondary leading-relaxed max-w-[34rem] text-pretty">
                  {product.composition}
                </p>
              </div>

              {/* Section 2: Craftsmanship */}
              <div className="flex flex-col gap-3 text-left">
                <h2 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Craftsmanship & Provenance
                </h2>
                <p className="text-body-sm text-text-secondary leading-relaxed max-w-[34rem] text-pretty">
                  {product.craft}
                </p>
              </div>

              {/* Section 3: Care Guide */}
              <div className="flex flex-col gap-3 text-left">
                <h2 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Care Instructions
                </h2>
                <p className="text-body-sm text-text-secondary leading-relaxed max-w-[34rem] text-pretty">
                  {product.care}
                </p>
              </div>

              {/* Section 4: Shipping & Returns */}
              <div className="flex flex-col gap-3 text-left">
                <h2 className="text-heading-xs font-display text-text-primary uppercase tracking-wide">
                  Shipping & Returns
                </h2>
                <p className="text-body-sm text-text-secondary leading-relaxed max-w-[34rem] text-pretty">
                  {product.shipping}
                </p>
              </div>

            </div>
          </div>
        </Section>

        {/* 4. Related Products Grid */}
        <Section id="related-products" padding="lg" className="border-t border-border/20">
          <Stack gap={10}>
            {/* Header */}
            <div className="flex items-center justify-between select-none">
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                Curated Suggestions
              </span>
              <h2 className="text-heading-sm text-text-primary">
                Related Pieces
              </h2>
            </div>

            {/* Grid Layout (Reusing standard Phase 3C Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {relatedProducts.map((rel) => (
                <div key={rel.id} className="group flex flex-col gap-4">
                  {/* Card surface */}
                  <div className="relative w-full aspect-product bg-surface border border-border rounded-sm overflow-hidden select-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.01]" />
                  </div>
                  {/* Metadata */}
                  <Stack gap={2} className="text-left">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase select-none">
                      {rel.collection}
                    </span>
                    <h3 className="text-body-sm font-medium text-text-primary group-hover:text-accent transition-colors duration-200">
                      {rel.name}
                    </h3>
                    <span className="text-[11px] text-text-secondary select-none">
                      {rel.material}
                    </span>
                    <div className="pt-1">
                      <Link 
                        href={`/products/${rel.slug}`}
                        className="text-[11px] font-semibold tracking-widest uppercase border-b border-text-primary/30 pb-0.5 hover:border-text-primary text-text-primary select-none cursor-pointer transition-colors duration-200"
                      >
                        View Object &rarr;
                      </Link>
                    </div>
                  </Stack>
                </div>
              ))}
            </div>
          </Stack>
        </Section>

        {/* 5. Recently Viewed */}
        <Section id="recently-viewed" padding="md" className="border-t border-border/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
            <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
              Recently Viewed
            </span>
            <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
              <span className="text-text-primary font-bold cursor-default select-none">
                {product.name}
              </span>
              <span>/</span>
              {relatedProducts.slice(0, 2).map((rel) => (
                <React.Fragment key={rel.id}>
                  <Link href={`/products/${rel.slug}`} className="hover:text-text-primary transition-colors">
                    {rel.name}
                  </Link>
                  <span className="last:hidden">/</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </Section>

      </Container>
    </main>
  )
}
