import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import Image from "next/image"
import { ProductCard } from "@/components/storefront/ProductCard"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { db } from "@/db/client"
import { colors, sizes, materials } from "@/db/schema"
import { findCollectionDetailBySlug } from "@/db/queries/collections"
import { ChevronRight, X } from "lucide-react"
import { inArray } from "drizzle-orm"

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    sort?: string
    color?: string
    size?: string
    material?: string
  }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const searchParams = await props.searchParams
  const data = await findCollectionDetailBySlug(slug, {
    sort: searchParams.sort,
    color: searchParams.color,
    size: searchParams.size,
    material: searchParams.material,
    limit: 48,
  })
  if (!data) return buildMetadata({ title: "Collection Not Found" })
  return buildMetadata({
    title: data.collection.seoTitle || data.collection.name,
    description: data.collection.seoDescription || data.collection.description || "Browse our lifestyle collection.",
  })
}

export default async function CollectionDetailPage(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    sort?: string
    color?: string
    size?: string
    material?: string
    page?: string
  }>
}) {
  const { slug } = await props.params
  const searchParams = await props.searchParams

  const data = await findCollectionDetailBySlug(slug, {
    sort: searchParams.sort,
    color: searchParams.color,
    size: searchParams.size,
    material: searchParams.material,
    limit: 48,
  })

  if (!data) {
    notFound()
  }

  const { collection, children, parent, productsResult } = data
  const products = productsResult.items
  const isEmptyState = products.length === 0

  // Batch query all variants for the current listing to get colors and sizes
  const productIds = products.map((p) => p.id)
  const [productVariants, allColors, allSizes, allMaterials] = await Promise.all([
    productIds.length > 0
      ? db.query.variants.findMany({
          where: (v) => inArray(v.productId, productIds),
          with: {
            color: true,
            size: true,
            inventory: true,
          },
        })
      : Promise.resolve([]),
    db.select().from(colors),
    db.select().from(sizes),
    db.select().from(materials),
  ])

  // Helper to build filter URLs
  const createFilterLink = (key: string, value: string | null) => {
    const params = new URLSearchParams()
    if (searchParams.sort) params.set("sort", searchParams.sort)
    if (searchParams.color) params.set("color", searchParams.color)
    if (searchParams.size) params.set("size", searchParams.size)
    if (searchParams.material) params.set("material", searchParams.material)

    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    const query = params.toString()
    return `/collections/${slug}${query ? `?${query}` : ""}`
  }

  const activeFilters = [
    searchParams.color && { key: "color", label: `Color: ${searchParams.color}` },
    searchParams.size && { key: "size", label: `Size: ${searchParams.size}` },
    searchParams.material && { key: "material", label: `Material: ${searchParams.material}` },
  ].filter(Boolean) as { key: string; label: string }[]

  return (
    <main className="flex-1 bg-background pt-[72px] md:pt-20">
      
      {/* 1. Breadcrumbs */}
      <div className="bg-white py-4 border-b border-neutral-100">
        <Container className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-secondary">
          <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-neutral-300" />
          <Link href="/collections" className="hover:text-text-primary transition-colors">Collections</Link>
          {parent && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-300" />
              <Link href={`/collections/${parent.slug}`} className="hover:text-text-primary transition-colors">{parent.name}</Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-neutral-300" />
          <span className="text-text-primary font-medium">{collection.name}</span>
        </Container>
      </div>

      {/* 2. Collection Hero Banner Overlay */}
      {collection.bannerUrl ? (
        <Section id="collection-detail-hero" padding="none" className="relative w-full aspect-[21/9] md:aspect-[32/10] overflow-hidden bg-neutral-900 border-b border-neutral-100 flex items-center select-none">
          <Image
            src={collection.bannerUrl}
            alt={collection.name}
            fill
            priority
            className="object-cover object-center"
          />
        </Section>
      ) : (
        /* Render standard text hero if no bannerUrl */
        <Section id="collection-detail-hero" padding="none" className="bg-white border-b border-neutral-100 pb-12 pt-8">
          <Container className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
            <div className="flex flex-col items-start text-left max-w-lg gap-4">
              <h1 className="text-display-md font-display text-text-primary uppercase tracking-wider">
                {collection.name}
              </h1>
              <p className="text-body-sm text-text-secondary leading-relaxed max-w-md">
                {collection.description || "Thoughtfully designed objects and essentials curated for contemporary living."}
              </p>
            </div>

            {collection.imageUrl && (
              <div className="relative w-full md:w-[450px] aspect-[16/9] border border-neutral-100 overflow-hidden bg-neutral-50 rounded-sm">
                <Image
                  src={collection.imageUrl}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  priority
                  className="object-cover"
                />
              </div>
            )}
          </Container>
        </Section>
      )}

      {/* 3. Child Collections Navigation Pills */}
      {children.length > 0 && (
        <div className="bg-white py-4 border-b border-neutral-100">
          <Container className="flex flex-wrap gap-2.5">
            {children.map(child => (
              <Link
                key={child.id}
                href={`/collections/${child.slug}`}
                className="px-4 py-1.5 border border-neutral-200 text-[11px] font-semibold tracking-wider uppercase hover:border-text-primary transition-all duration-200 rounded-full"
              >
                {child.name}
              </Link>
            ))}
          </Container>
        </div>
      )}

      {/* 4. Catalogue Toolbar / Filters & Sorting */}
      <Section id="catalogue-toolbar" padding="none" className="bg-white py-5 border-b border-neutral-100">
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
                        href={createFilterLink("color", searchParams.color === c.name ? null : c.name)}
                        className={`text-body-sm hover:text-text-primary transition-colors flex items-center justify-between ${searchParams.color === c.name ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
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
                        href={createFilterLink("size", searchParams.size === s.name ? null : s.name)}
                        className={`text-body-sm hover:text-text-primary transition-colors ${searchParams.size === s.name ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
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
                        href={createFilterLink("material", searchParams.material === m.name ? null : m.name)}
                        className={`text-body-sm hover:text-text-primary transition-colors ${searchParams.material === m.name ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
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
                {productsResult.totalCount || products.length} Items
              </span>

              <details className="relative group/details">
                <summary className="list-none outline-none text-[11px] font-semibold tracking-wider text-text-secondary uppercase cursor-pointer hover:text-text-primary py-2 flex items-center gap-1 select-none [&::-webkit-details-marker]:hidden">
                  Sort By <span className="text-[9px] text-text-tertiary">▼</span>
                </summary>
                <div className="absolute right-0 mt-1 bg-surface border border-border p-3 min-w-[180px] z-20 shadow-lg">
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href={createFilterLink("sort", "newest")}
                      className={`text-body-sm hover:text-text-primary transition-colors ${!searchParams.sort || searchParams.sort === "newest" ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
                    >
                      Newest
                    </Link>
                    <Link
                      href={createFilterLink("sort", "price_asc")}
                      className={`text-body-sm hover:text-text-primary transition-colors ${searchParams.sort === "price_asc" ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
                    >
                      Price: Low to High
                    </Link>
                    <Link
                      href={createFilterLink("sort", "price_desc")}
                      className={`text-body-sm hover:text-text-primary transition-colors ${searchParams.sort === "price_desc" ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
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
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-50">
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
                href={`/collections/${slug}`}
                className="text-[10px] text-text-secondary hover:text-text-primary underline tracking-wider uppercase ml-2"
              >
                Clear All
              </Link>
            </div>
          )}
        </Container>
      </Section>

      {/* 5. Product Catalogue Grid */}
      <Section id="catalogue-grid" padding="none" className="bg-background py-1.5 w-full">
        {isEmptyState ? (
          <Container className="py-24">
            <div className="text-center max-w-sm mx-auto flex flex-col items-center gap-4">
              <p className="text-heading-sm font-display text-text-primary">No Matching Objects</p>
              <p className="text-body-sm text-text-secondary">Try refining your color, size, or material filters to discover other pieces.</p>
              <Link href={`/collections/${slug}`} className="mt-4 px-6 py-2 border border-text-primary text-[10px] uppercase tracking-widest font-bold hover:bg-text-primary hover:text-surface transition-colors">
                Reset Filters
              </Link>
            </div>
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

              const inStock = itemVariants.length > 0
                ? itemVariants.some((v) => v.inventory ? v.inventory.quantity > 0 : true)
                : false

              return (
                <ProductCard 
                  key={product.id}
                  product={product as any}
                  itemColors={itemColors}
                  itemSizes={itemSizes}
                  priority={index < 4}
                  isFirstInGrid={index === 0}
                  inStock={inStock}
                />
              )
            })}
          </div>
        )}
      </Section>
    </main>
  )
}
