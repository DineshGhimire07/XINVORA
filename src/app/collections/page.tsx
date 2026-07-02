/**
 * app/collections/page.tsx — XINVORA Collections Experience Foundation
 *
 * Implements the premium Collections browsing experience.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"

export const metadata = buildMetadata({
  title: "Collections",
  description: "Browse the XINVORA catalogue. Refined objects, garment collections, and meticulous accessories designed for everyday permanence.",
})

interface ProductItem {
  id: string
  name: string
  collection: string
  material: string
  imageIndex: number
}

const PRODUCTS: ProductItem[] = [
  { id: "x-01", name: "Linen Draped Coat", collection: "Collection I", material: "Organic Linen", imageIndex: 1 },
  { id: "x-02", name: "Tailored Cropped Jacket", collection: "Collection I", material: "Structured Cotton", imageIndex: 2 },
  { id: "x-03", name: "Stoneware Vessel", collection: "Collection II", material: "Raw Ceramic", imageIndex: 3 },
  { id: "x-04", name: "Oak Console Table", collection: "Collection II", material: "European Oak", imageIndex: 4 },
  { id: "x-05", name: "Leather Zip Case", collection: "Collection III", material: "Full-Grain Leather", imageIndex: 5 },
  { id: "x-06", name: "Brass Incense Holder", collection: "Collection III", material: "Solid Brass", imageIndex: 1 },
  { id: "x-07", name: "Relaxed Trouser", collection: "Collection I", material: "Fibre Linen", imageIndex: 2 },
  { id: "x-08", name: "Structured Overshirt", collection: "Collection I", material: "Raw Canvas", imageIndex: 3 },
  { id: "x-09", name: "Linen Cushion Cover", collection: "Collection II", material: "Washed Linen", imageIndex: 4 },
  { id: "x-10", name: "Clay Bowl Set", collection: "Collection II", material: "Terracotta", imageIndex: 5 },
  { id: "x-11", name: "Wool Travel Case", collection: "Collection III", material: "Merino Wool", imageIndex: 1 },
  { id: "x-12", name: "Oak Lounge Chair", collection: "Collection III", material: "Saddle Leather & Oak", imageIndex: 2 },
]

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const isEmptyState = resolvedParams.empty === "true"

  return (
    <main className="flex-1 bg-background pt-20 md:pt-28">
      {isEmptyState ? (
        <EmptyStateBlock />
      ) : (
        <>
          {/* 1. Collection Hero */}
          <Section id="collections-hero" padding="md" className="bg-background">
            <Container>
              <div className="flex flex-col items-start text-left max-w-[32rem] gap-6">
                <span className="text-overline text-accent tracking-overline uppercase select-none">
                  Collections
                </span>
                <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
                  Designed for everyday permanence.
                </h1>
                <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                  A comprehensive selection of garments, homeware, and everyday accessories, formed with patience and crafted to age beautifully.
                </p>
              </div>
            </Container>
          </Section>

          {/* 2. Category Navigation */}
          <Section id="category-navigation" padding="none" className="bg-background">
            <Container>
              <nav 
                className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-none border-b border-border/40 pb-4"
                aria-label="Category filter navigation"
              >
                <Link 
                  href="/collections" 
                  className="text-[11px] font-bold tracking-widest text-text-primary uppercase border-b-2 border-text-primary pb-3 -mb-[18px] transition-colors select-none"
                >
                  All
                </Link>
                <Link 
                  href="/collections?category=new" 
                  className="text-[11px] font-semibold tracking-widest text-text-secondary hover:text-text-primary uppercase pb-3 transition-colors select-none"
                >
                  New Arrivals
                </Link>
                <Link 
                  href="/collections?category=men" 
                  className="text-[11px] font-semibold tracking-widest text-text-secondary hover:text-text-primary uppercase pb-3 transition-colors select-none"
                >
                  Men
                </Link>
                <Link 
                  href="/collections?category=women" 
                  className="text-[11px] font-semibold tracking-widest text-text-secondary hover:text-text-primary uppercase pb-3 transition-colors select-none"
                >
                  Women
                </Link>
                <Link 
                  href="/collections?category=accessories" 
                  className="text-[11px] font-semibold tracking-widest text-text-secondary hover:text-text-primary uppercase pb-3 transition-colors select-none"
                >
                  Accessories
                </Link>
                <Link 
                  href="/collections?category=essentials" 
                  className="text-[11px] font-semibold tracking-widest text-text-secondary hover:text-text-primary uppercase pb-3 transition-colors select-none"
                >
                  Essentials
                </Link>
              </nav>
            </Container>
          </Section>

          {/* 3. Catalogue Toolbar */}
          <Section id="catalogue-toolbar" padding="sm" className="bg-background">
            <Container>
              <div className="flex items-center justify-between text-[11px] font-semibold tracking-widest text-text-secondary uppercase select-none border-y border-border/40 py-5">
                <div>
                  {PRODUCTS.length} Objects
                </div>
                <div className="flex items-center gap-8">
                  <span className="cursor-pointer hover:text-text-primary transition-colors">
                    Filter
                  </span>
                  <span className="cursor-pointer hover:text-text-primary transition-colors">
                    Sort By
                  </span>
                </div>
              </div>
            </Container>
          </Section>

          {/* 4. Product Catalogue Grid */}
          <Section id="catalogue-grid" padding="md" className="bg-background">
            <Container>
              {/* 
                Desktop: 4 Columns
                Tablet: 2 Columns
                Mobile: 1 Column
              */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
                {PRODUCTS.map((product) => (
                  <div key={product.id} className="group flex flex-col gap-4">
                    {/* Visual Card Image Placeholder */}
                    <div className="relative w-full aspect-product bg-surface border border-border rounded-sm overflow-hidden select-none">
                      {/* Subtle inner grid outline representing future visual layout border */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.02]" />
                    </div>

                    {/* Product metadata */}
                    <Stack gap={2} className="text-left">
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase select-none">
                        {product.collection}
                      </span>
                      <h3 className="text-body-md font-medium text-text-primary group-hover:text-accent transition-colors duration-200">
                        {product.name}
                      </h3>
                      <span className="text-[12px] text-text-secondary select-none">
                        {product.material}
                      </span>
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold tracking-widest uppercase border-b border-text-primary/30 pb-0.5 hover:border-text-primary text-text-primary select-none cursor-pointer transition-colors duration-200">
                          View Object &rarr;
                        </span>
                      </div>
                    </Stack>
                  </div>
                ))}
              </div>
            </Container>
          </Section>

          {/* 5. Pagination */}
          <Section id="catalogue-pagination" padding="md" className="bg-background border-t border-border/20">
            <Container>
              <div className="flex items-center justify-center gap-2 select-none">
                <span className="w-9 h-9 flex items-center justify-center text-[11px] font-bold border border-text-primary rounded-sm text-text-primary cursor-pointer transition-colors duration-200">
                  1
                </span>
                <span className="w-9 h-9 flex items-center justify-center text-[11px] font-semibold text-text-secondary hover:text-text-primary cursor-pointer transition-colors duration-200">
                  2
                </span>
                <span className="w-9 h-9 flex items-center justify-center text-[11px] font-semibold text-text-secondary hover:text-text-primary cursor-pointer transition-colors duration-200">
                  3
                </span>
              </div>
            </Container>
          </Section>
        </>
      )}
    </main>
  )
}

/**
 * 6. Elegant Editorial Empty State Block
 */
function EmptyStateBlock() {
  return (
    <Section id="collections-empty" padding="xl" className="bg-background min-h-[60vh] flex items-center">
      <Container>
        <Stack gap={8} align="center" className="text-center max-w-[32rem] mx-auto py-16">
          <div className="flex flex-col gap-4">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Archive Search
            </span>
            <h2 className="text-heading-xl font-display text-text-primary leading-tight tracking-tight">
              Nothing here yet.
            </h2>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              The selection you are browsing has no active objects. We release collections in highly considered editions.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/collections">
              <Button variant="primary" size="lg" className="w-[14rem] tracking-wider uppercase">
                Return to Catalogue
              </Button>
            </Link>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}
