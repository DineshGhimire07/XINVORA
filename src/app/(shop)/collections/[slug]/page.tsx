import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import Image from "next/image"
import { ProductCard } from "@/components/storefront/ProductCard"
import { CollectionFilterToolbar } from "@/components/storefront/CollectionFilterToolbar"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { db } from "@/db/client"
import { colors, sizes, materials } from "@/db/schema"
import { findCollectionDetailBySlug } from "@/db/queries/collections"
import { ChevronRight } from "lucide-react"
import { inArray } from "drizzle-orm"
import { optimizeCloudinaryUrl, SHIMMER_BLUR_DATA_URL } from "@/lib/image-optimizer"
import { CollectionViewTracker } from "@/features/analytics/components/CollectionViewTracker"

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

  return (
    <main className="flex-1 bg-background pt-[72px] md:pt-20">
      {/* Analytics: fire COLLECTION_VIEW once on mount (consent-gated) */}
      <CollectionViewTracker collectionId={collection.id} collectionName={collection.name} />
      
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
            src={optimizeCloudinaryUrl(collection.bannerUrl, { width: 1920 })}
            alt={collection.name}
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={SHIMMER_BLUR_DATA_URL}
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
                  src={optimizeCloudinaryUrl(collection.imageUrl, { width: 900 })}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  priority
                  fetchPriority="high"
                  placeholder="blur"
                  blurDataURL={SHIMMER_BLUR_DATA_URL}
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
      <CollectionFilterToolbar
        slug={slug}
        totalItems={productsResult.totalCount || products.length}
        colors={allColors}
        sizes={allSizes}
        materials={allMaterials}
        activeColor={searchParams.color}
        activeSize={searchParams.size}
        activeMaterial={searchParams.material}
        activeSort={searchParams.sort}
      />

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
