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
import { findCollectionDetailBySlug, getFilterAttributes } from "@/db/queries/collections"
import { ChevronRight } from "lucide-react"
import { inArray, and, eq } from "drizzle-orm"
import { collections } from "@/db/schema"
import { optimizeCloudinaryUrl, SHIMMER_BLUR_DATA_URL } from "@/lib/image-optimizer"
import { CollectionViewTracker } from "@/features/analytics/components/CollectionViewTracker"

export const revalidate = 3600

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const slugToLookup = slug === "limited-edition" ? "limited" : slug
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.slug, slugToLookup), eq(collections.isActive, true)),
    columns: { name: true, seoTitle: true, description: true, seoDescription: true },
  })
  if (!collection) return buildMetadata({ title: "Collection Not Found" })
  return buildMetadata({
    title: collection.seoTitle || collection.name,
    description: collection.seoDescription || collection.description || "Browse our lifestyle collection.",
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

  const dataPromise = findCollectionDetailBySlug(slug, {
    sort: searchParams.sort,
    color: searchParams.color,
    size: searchParams.size,
    material: searchParams.material,
    limit: 48,
  })

  const attributesPromise = getFilterAttributes()

  const [data, { allColors, allSizes, allMaterials }] = await Promise.all([
    dataPromise,
    attributesPromise,
  ])

  if (!data) {
    notFound()
  }

  const { collection, children, parent, productsResult, variantCardMap } = data
  const products = productsResult.items
  const isEmptyState = products.length === 0

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
      {collection.bannerUrl || collection.bannerMobileUrl ? (
        <Section id="collection-detail-hero" padding="none" className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[32/10] overflow-hidden bg-neutral-900 border-b border-neutral-100 flex items-center select-none">
          {/* Desktop / Laptop Banner */}
          {collection.bannerUrl && (
            <Image
              src={optimizeCloudinaryUrl(collection.bannerUrl, { width: 1920 })}
              alt={collection.name}
              fill
              sizes="100vw"
              priority
              fetchPriority="high"
              className={`object-cover object-center ${collection.bannerMobileUrl ? "hidden md:block" : "block"}`}
            />
          )}
          {/* Mobile Phone Banner */}
          {(collection.bannerMobileUrl || collection.bannerUrl) && (
            <Image
              src={optimizeCloudinaryUrl(collection.bannerMobileUrl || collection.bannerUrl!, { width: 1080 })}
              alt={collection.name}
              fill
              sizes="100vw"
              priority
              fetchPriority="high"
              className={`object-cover object-center ${collection.bannerMobileUrl ? "block md:hidden" : "hidden"}`}
            />
          )}
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
    </main>
  )
}
