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
import { ProductCard } from "@/components/storefront/ProductCard"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import Image from "next/image"
import { findProducts, findRootCategories } from "@/db/queries"
import type { CatalogFilterParams, SortField } from "@/db/queries/types"
import { db } from "@/db/client"
import { inArray } from "drizzle-orm"
import { colors, sizes, materials } from "@/db/schema"
import { X } from "lucide-react"

export const metadata = buildMetadata({
  title: "Collections",
  description: "Browse the XINVORA catalogue. Refined objects, garment collections, and meticulous accessories designed for everyday permanence.",
})

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  
  // Parse Search Params into CatalogFilterParams
  const categorySlug = typeof resolvedParams.category === "string" ? resolvedParams.category : undefined
  const cursor = typeof resolvedParams.cursor === "string" ? resolvedParams.cursor : undefined
  const sort = typeof resolvedParams.sort === "string" ? (resolvedParams.sort as SortField) : "newest"
  const color = typeof resolvedParams.color === "string" ? resolvedParams.color : undefined
  const size = typeof resolvedParams.size === "string" ? resolvedParams.size : undefined
  const material = typeof resolvedParams.material === "string" ? resolvedParams.material : undefined

  const filterParams: CatalogFilterParams = {
    categorySlug,
    colorSlugs: color ? [color] : undefined,
    sizeSlugs: size ? [size] : undefined,
    materialSlugs: material ? [material] : undefined,
    cursor,
    sort,
    limit: 12,
  }

  // Fetch Data concurrently
  const [paginatedProducts, rootCategories, allColors, allSizes, allMaterials] = await Promise.all([
    findProducts(filterParams),
    findRootCategories(),
    db.select().from(colors),
    db.select().from(sizes),
    db.select().from(materials),
  ])

  const products = paginatedProducts.items
  const isEmptyState = products.length === 0 && !cursor

  // Helper to build filter URLs
  const createFilterLink = (key: string, value: string | null) => {
    const params = new URLSearchParams()
    if (categorySlug) params.set("category", categorySlug)
    if (sort) params.set("sort", sort)
    if (color) params.set("color", color)
    if (size) params.set("size", size)
    if (material) params.set("material", material)

    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    const query = params.toString()
    return `/collections${query ? `?${query}` : ""}`
  }

  const activeFilters = [
    color && { key: "color", label: `Color: ${color}` },
    size && { key: "size", label: `Size: ${size}` },
    material && { key: "material", label: `Material: ${material}` },
  ].filter(Boolean) as { key: string; label: string }[]

  // Batch query all variants for the current listing to get colors and sizes
  const productIds = products.map((p) => p.id)
  let productVariants: any[] = []
  if (productIds.length > 0) {
    productVariants = await db.query.variants.findMany({
      where: (v) => inArray(v.productId, productIds),
      with: {
        color: true,
        size: true,
      },
    })
  } // Only show empty state if first page has no results

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
                  {categorySlug ? categorySlug.replace(/-/g, ' ') : 'Catalogue'}
                </span>
                <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight capitalize">
                  {categorySlug ? `The ${categorySlug.replace(/-/g, ' ')} Edit` : 'Designed for everyday permanence.'}
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
                className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-none border-b border-border/40 pb-4 pr-8 md:pr-0 [mask-image:linear-gradient(to_right,white_90%,transparent)] md:[mask-image:none]"
                aria-label="Category filter navigation"
              >
                <Link 
                  href="/collections" 
                  className={`text-[11px] font-bold tracking-widest uppercase pb-3 -mb-[18px] transition-colors select-none ${
                    !categorySlug ? 'text-text-primary border-b-2 border-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All
                </Link>
                {rootCategories.map((cat) => (
                  <Link 
                    key={cat.id}
                    href={`/collections?category=${cat.slug}`} 
                    className={`text-[11px] font-semibold tracking-widest uppercase pb-3 transition-colors select-none ${
                      categorySlug === cat.slug ? 'text-text-primary border-b-2 border-text-primary -mb-[18px]' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </Container>
          </Section>

          {/* 3. Catalogue Toolbar / Filters & Sorting */}
          <Section id="catalogue-toolbar" padding="none" className="bg-background py-5 border-b border-border/40">
            <Container className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Filter pills */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* Color filter */}
                  <details className="relative group/details">
                    <summary className="list-none outline-none text-[11px] font-semibold tracking-wider text-text-secondary uppercase cursor-pointer hover:text-text-primary py-2 flex items-center gap-1 select-none [&::-webkit-details-marker]:hidden">
                      Color <span className="text-[9px] text-text-tertiary">▼</span>
                    </summary>
                    <div className="absolute left-0 mt-1 bg-surface border border-border p-4 min-w-[200px] z-20 shadow-lg">
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {allColors.map(c => (
                          <Link
                            key={c.id}
                            href={createFilterLink("color", color === c.name ? null : c.name)}
                            className={`text-body-sm hover:text-text-primary transition-colors flex items-center justify-between ${color === c.name ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
                          >
                            <span>{c.name}</span>
                            {c.hexCode && (
                              <span className="w-3 h-3 rounded-full border border-neutral-200" style={{ backgroundColor: c.hexCode }} />
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </details>

                  {/* Size filter */}
                  <details className="relative group/details">
                    <summary className="list-none outline-none text-[11px] font-semibold tracking-wider text-text-secondary uppercase cursor-pointer hover:text-text-primary py-2 flex items-center gap-1 select-none [&::-webkit-details-marker]:hidden">
                      Size <span className="text-[9px] text-text-tertiary">▼</span>
                    </summary>
                    <div className="absolute left-0 mt-1 bg-surface border border-border p-4 min-w-[150px] z-20 shadow-lg">
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {allSizes.map(s => (
                          <Link
                            key={s.id}
                            href={createFilterLink("size", size === s.name ? null : s.name)}
                            className={`text-body-sm hover:text-text-primary transition-colors ${size === s.name ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </details>

                  {/* Material filter */}
                  <details className="relative group/details">
                    <summary className="list-none outline-none text-[11px] font-semibold tracking-wider text-text-secondary uppercase cursor-pointer hover:text-text-primary py-2 flex items-center gap-1 select-none [&::-webkit-details-marker]:hidden">
                      Material <span className="text-[9px] text-text-tertiary">▼</span>
                    </summary>
                    <div className="absolute left-0 mt-1 bg-surface border border-border p-4 min-w-[180px] z-20 shadow-lg">
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {allMaterials.map(m => (
                          <Link
                            key={m.id}
                            href={createFilterLink("material", material === m.name ? null : m.name)}
                            className={`text-body-sm hover:text-text-primary transition-colors ${material === m.name ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
                          >
                            {m.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>

                {/* Sorting & Item Count */}
                <div className="flex items-center gap-6">
                  <span className="text-[11px] font-medium tracking-wide text-text-secondary uppercase select-none">
                    {paginatedProducts.totalCount || products.length} Items
                  </span>

                  <details className="relative group/details">
                    <summary className="list-none outline-none text-[11px] font-semibold tracking-wider text-text-secondary uppercase cursor-pointer hover:text-text-primary py-2 flex items-center gap-1 select-none [&::-webkit-details-marker]:hidden">
                      Sort By <span className="text-[9px] text-text-tertiary">▼</span>
                    </summary>
                    <div className="absolute right-0 mt-1 bg-surface border border-border p-3 min-w-[180px] z-20 shadow-lg">
                      <div className="flex flex-col gap-2.5">
                        <Link
                          href={createFilterLink("sort", "newest")}
                          className={`text-body-sm hover:text-text-primary transition-colors ${sort === "newest" ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
                        >
                          Newest
                        </Link>
                        <Link
                          href={createFilterLink("sort", "price_asc")}
                          className={`text-body-sm hover:text-text-primary transition-colors ${sort === "price_asc" ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
                        >
                          Price: Low to High
                        </Link>
                        <Link
                          href={createFilterLink("sort", "price_desc")}
                          className={`text-body-sm hover:text-text-primary transition-colors ${sort === "price_desc" ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
                        >
                          Price: High to Low
                        </Link>
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              {/* Active filters row */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
                  <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase mr-2">
                    Active:
                  </span>
                  {activeFilters.map(filter => (
                    <Link
                      key={filter.key}
                      href={createFilterLink(filter.key, null)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50 hover:bg-neutral-100 text-[10px] text-text-primary tracking-wide border border-neutral-200 transition-colors uppercase font-medium rounded-full"
                    >
                      {filter.label}
                      <X className="w-3 h-3 text-text-secondary hover:text-text-primary" />
                    </Link>
                  ))}
                  <Link
                    href="/collections"
                    className="text-[10px] text-text-secondary hover:text-text-primary underline tracking-wider uppercase ml-2"
                  >
                    Clear All
                  </Link>
                </div>
              )}
            </Container>
          </Section>

          {/* 4. Product Catalogue Grid */}
          <Section id="catalogue-grid" padding="none" className="bg-background py-1.5 w-full">
            {products.length === 0 && cursor ? (
              <Container className="py-20 text-center">
                <p className="text-body-sm text-text-secondary">End of catalog.</p>
              </Container>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-1.5 gap-y-10 w-full px-0">
                {products.map((product, index) => {
                  // Extract colors and sizes from variants batch query
                  const itemVariants = productVariants.filter((v) => v.productId === product.id)
                  
                  const itemColors = Array.from(
                    new Map(
                      itemVariants
                        .filter((v) => v.color)
                        .map((v) => [v.color!.id, v.color!])
                    ).values()
                  )

                  const itemSizes = Array.from(
                    new Map(
                      itemVariants
                        .filter((v) => v.size)
                        .map((v) => [v.size!.id, v.size!])
                    ).values()
                  ).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

                  return (
                    <ProductCard 
                      key={product.id}
                      product={product as any}
                      itemColors={itemColors}
                      itemSizes={itemSizes}
                      priority={index < 4}
                      isFirstInGrid={index === 0}
                    />
                  )
                })}
              </div>
            )}
          </Section>

          {/* 5. Pagination (Cursor-based Next) */}
          {paginatedProducts.hasMore && (
            <Section id="catalogue-pagination" padding="md" className="bg-background border-t border-border/20">
              <Container>
                <div className="flex items-center justify-center pt-8 pb-12">
                  <Link 
                    href={`/collections?${new URLSearchParams({
                      ...(resolvedParams as Record<string, string>),
                      cursor: paginatedProducts.nextCursor ?? ""
                    }).toString()}`}
                  >
                    <Button variant="outline" size="lg" className="w-[14rem]">
                      Load More
                    </Button>
                  </Link>
                </div>
              </Container>
            </Section>
          )}
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
            <h1 className="text-heading-xl font-display text-text-primary leading-tight tracking-tight">
              Nothing here yet.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              The selection you are browsing has no active objects. We release collections in highly considered editions.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/collections">
              <Button variant="primary" size="lg" className="w-[14rem]">
                Return to Catalogue
              </Button>
            </Link>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}
