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
import { CollectionFilterToolbar } from "@/components/storefront/CollectionFilterToolbar"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import Image from "next/image"
import { findProducts } from "@/db/queries"
import { findHomepageCollections, getFilterAttributes, findVariantCardMapByProductIds } from "@/db/queries/collections"
import type { CatalogFilterParams, SortField } from "@/db/queries/types"
import { db } from "@/db/client"
import { inArray } from "drizzle-orm"
import { PDPBackButton } from "@/components/storefront/PDPBackButton"

export const metadata = buildMetadata({
  title: "Collections",
  description: "Browse the XINVORA catalogue. Refined objects, garment collections, and meticulous accessories designed for everyday permanence.",
})

export const revalidate = 3600

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  
  // Parse Search Params into CatalogFilterParams
  const collectionSlug = typeof resolvedParams.collection === "string" ? resolvedParams.collection : undefined
  const cursor = typeof resolvedParams.cursor === "string" ? resolvedParams.cursor : undefined
  const sort = typeof resolvedParams.sort === "string" ? (resolvedParams.sort as SortField) : "newest"
  const color = typeof resolvedParams.color === "string" ? resolvedParams.color : undefined
  const size = typeof resolvedParams.size === "string" ? resolvedParams.size : undefined
  const material = typeof resolvedParams.material === "string" ? resolvedParams.material : undefined

  const filterParams: CatalogFilterParams = {
    collectionSlug,
    colorSlugs: color ? [color] : undefined,
    sizeSlugs: size ? [size] : undefined,
    materialSlugs: material ? [material] : undefined,
    cursor,
    sort,
    limit: 48,
  }

  // Fetch Data concurrently
  const [paginatedProducts, adminCollections, { allColors, allSizes, allMaterials }] = await Promise.all([
    findProducts(filterParams),
    findHomepageCollections(50),          // all active collections, dynamic
    getFilterAttributes(),
  ])

  const products = paginatedProducts.items
  const isEmptyState = products.length === 0 && !cursor

  // Batch query variant card info (cached with single JOIN query)
  const productIds = products.map((p) => p.id)
  const variantCardMap = productIds.length > 0
    ? await findVariantCardMapByProductIds(JSON.stringify(productIds))
    : {}

  return (
    <main className="flex-1 bg-background pt-20 md:pt-28">
      <>
          {/* 1. Collection Hero */}
          <Section id="collections-hero" padding="md" className="bg-background">
            <Container>
              <PDPBackButton fallbackUrl="/" label="Back" className="mb-4 -ml-1" />
              <div className="flex flex-col items-start text-left max-w-[32rem] gap-6">
                <span className="text-overline text-accent tracking-overline uppercase select-none">
                  {collectionSlug
                    ? (adminCollections.find((c) => c.slug === collectionSlug)?.name ?? collectionSlug.replace(/-/g, ' '))
                    : 'Catalogue'}
                </span>
                <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight capitalize">
                  {collectionSlug
                    ? `The ${(adminCollections.find((c) => c.slug === collectionSlug)?.name ?? collectionSlug.replace(/-/g, ' '))} Edit`
                    : 'Designed for everyday permanence.'}
                </h1>
                <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
                  A comprehensive selection of garments, homeware, and everyday accessories, formed with patience and crafted to age beautifully.
                </p>
              </div>
            </Container>
          </Section>

          {/* 2. Collection Navigation Tabs — dynamic from Admin Panel */}
          <Section id="collection-navigation" padding="none" className="bg-background">
            <Container>
              <nav
                className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-none border-b border-border/40 pb-4 pr-8 md:pr-0 [mask-image:linear-gradient(to_right,white_90%,transparent)] md:[mask-image:none]"
                aria-label="Collection filter navigation"
              >
                {/* ALL tab */}
                <Link
                  href="/collections"
                  className={`text-[11px] font-bold tracking-widest uppercase pb-3 -mb-[18px] transition-colors select-none ${
                    !collectionSlug
                      ? 'text-text-primary border-b-2 border-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All
                </Link>

                {/* One tab per active admin collection → redirects to /collections/[slug] */}
                {adminCollections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.slug}`}
                    className="text-[11px] font-semibold tracking-widest uppercase pb-3 transition-colors select-none text-text-secondary hover:text-text-primary"
                  >
                    {col.name}
                  </Link>
                ))}
              </nav>
            </Container>
          </Section>

          {/* 3. Catalogue Toolbar / Filters & Sorting */}
          <CollectionFilterToolbar
            slug="collections"
            totalItems={paginatedProducts.totalCount || products.length}
            colors={allColors}
            sizes={allSizes}
            materials={allMaterials}
            activeColor={color}
            activeSize={size}
            activeMaterial={material}
            activeSort={sort}
          />

          {/* 4. Product Catalogue Grid */}
          <Section id="catalogue-grid" padding="none" className="bg-background py-1.5 w-full">
            {products.length === 0 ? (
              <Container className="py-24 text-center">
                <p className="text-body-sm text-text-secondary">
                  {collectionSlug
                    ? `No products found in "${adminCollections.find((c) => c.slug === collectionSlug)?.name ?? collectionSlug}" yet.`
                    : "No products found."}
                </p>
                {collectionSlug && (
                  <Link href="/collections" className="mt-4 inline-block text-[11px] uppercase tracking-widest underline text-text-secondary hover:text-text-primary">
                    View all
                  </Link>
                )}
              </Container>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-1.5 gap-y-10 w-full px-0">
                {products.map((product, index) => {
                  const cardData = variantCardMap?.[product.id] || {
                    colors: [],
                    sizes: [],
                    inStock: true,
                  }

                  return (
                    <ProductCard 
                      key={product.id}
                      product={product as any}
                      itemColors={cardData.colors}
                      itemSizes={cardData.sizes}
                      priority={index < 4}
                      isFirstInGrid={index === 0}
                      inStock={cardData.inStock}
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
