import * as React from "react"
import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import { ProductGallery } from "@/components/storefront/ProductGallery"
import { ProductVariantSelector } from "@/components/storefront/ProductVariantSelector"
import { ProductAccordion } from "@/components/storefront/ProductAccordion"
import { ProductTrustGrid } from "@/components/storefront/ProductTrustGrid"
import { ProductInstagramCard } from "@/components/storefront/ProductInstagramCard"
import { ProductTryOnGuide } from "@/components/storefront/ProductTryOnGuide"
import { ProductEditorialPair } from "@/components/storefront/ProductEditorialPair"
import { WishlistToggleIcon } from "@/components/shop/WishlistToggleIcon"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { findProductBySlug, findProducts, findLookbookSlides, findProductPairings } from "@/db/queries"
import type { Metadata } from "next"
import { db } from "@/db/client"
import { priceBookEntries, priceBooks, categories } from "@/db/schema"
import { and, eq, inArray } from "drizzle-orm"
import { type TimingEntry, timedPromise, printTimingSummary } from "@/lib/perf"
import { ShopTheLookCarousel } from "@/components/storefront/ShopTheLookCarousel"
import { ProductsInLook } from "@/components/storefront/ProductsInLook"
import { ProductCard } from "@/components/storefront/ProductCard"

export const revalidate = 3600

export async function generateStaticParams() {
  // Pre-build the most recently published products at build time.
  // Products not in this list still render fine on first visit and
  // get cached automatically afterward (dynamicParams defaults to true).
  const { items } = await findProducts({ limit: 100, sort: "newest" })
  return items.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await findProductBySlug(slug)
  if (!product) return buildMetadata({ title: "Product Not Found" })
  return buildMetadata({
    title: product.name,
    description: product.description || `Discover the ${product.name} at XINVORA.`,
  })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const totalStart = performance.now()
  const timings: TimingEntry[] = []

  const product = await timedPromise('findProductBySlug', timings, findProductBySlug(slug))

  if (!product) {
    notFound()
  }

  // Resolve all secondary data concurrently now that product ID is known
  const activeVariantsRaw = product.variants.filter(v => v.isActive)
  const hasSizeVariants = activeVariantsRaw.some(v => v.sizeId !== null)
  const activeVariants = hasSizeVariants
    ? activeVariantsRaw.filter(v => v.sizeId !== null)
    : activeVariantsRaw
  const variantIds = activeVariants.map((v) => v.id)

  const [parentCategory, relatedResponse, variantPrices, lookbookData, pairingProducts] = await Promise.all([
    // Parent category breadcrumb
    timedPromise('parentCategory', timings, product.category?.parentId
      ? db.query.categories.findFirst({ where: eq(categories.id, product.category.parentId) })
      : Promise.resolve(null)),
    // Related products
    timedPromise('relatedProducts', timings, product.category?.slug
      ? findProducts({ categorySlug: product.category.slug, limit: 6 })
      : Promise.resolve({ items: [], nextCursor: null, prevCursor: null, hasMore: false })),
    // Variant prices
    timedPromise('variantPrices', timings, variantIds.length > 0
      ? db
          .select({
            variantId: priceBookEntries.variantId,
            price: priceBookEntries.price,
            compareAtPrice: priceBookEntries.compareAtPrice,
          })
          .from(priceBookEntries)
          .innerJoin(priceBooks, and(eq(priceBookEntries.priceBookId, priceBooks.id), eq(priceBooks.isDefault, true)))
          .where(inArray(priceBookEntries.variantId, variantIds))
      : Promise.resolve([])),
    // Global lookbook slides (same carousel everywhere, no per-product filtering)
    timedPromise('lookbookSlides', timings, findLookbookSlides()),
    // Product pairings for "Products in This Look"
    timedPromise('productPairings', timings, findProductPairings(product.id)),
  ])

  const relatedProducts = relatedResponse.items
    .filter((p) => p.id !== product.id)
    .slice(0, 5)

  const variantsWithPrices = activeVariants.map((v) => {
    const p = variantPrices.find((vp) => vp.variantId === v.id)
    return {
      ...v,
      price: p ? p.price : null,
      compareAtPrice: p ? p.compareAtPrice : null,
    }
  })

  const rawColors = Array.from(new Map(activeVariants.filter(v => v.color).map(v => [v.color!.id, v.color!])).values())
  const rawSizes = Array.from(new Map(activeVariants.filter(v => v.size).map(v => [v.size!.id, v.size!])).values())

  // If colors is empty (e.g. base variant creation), provide a default color dot
  const colors = rawColors.length > 0 ? rawColors : [{ id: "default-color", name: "Default", hexCode: "" }]

  // If sizes is empty (e.g. base variant creation), provide standard sizing options S, M, L, XL
  const sizes = rawSizes.length > 0 
    ? rawSizes 
    : [
        { id: "s", name: "S", abbreviation: "S" },
        { id: "m", name: "M", abbreviation: "M" },
        { id: "l", name: "L", abbreviation: "L" },
        { id: "xl", name: "XL", abbreviation: "XL" },
      ]

  // Check inventory availability (naive global check for now)
  const inStock = activeVariants.some(v => v.inventory && v.inventory.quantity > 0)
  const availabilityText = inStock ? "Available" : "Out of Stock"

  // Material list extracted dynamically from productMaterials relations
  const materialsList = product.productMaterials?.map((pm: any) => pm.material?.name).filter(Boolean) || []
  const primaryMaterial = materialsList.length > 0 ? materialsList.join(", ") : "Premium Materials"

  printTimingSummary('ProductDetailPage', timings, performance.now() - totalStart)

  const hasLookbook = lookbookData.slides.length > 0
  const hasPairings = pairingProducts.length > 0

  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>

        {/* Compact "Shop the Look" carousel — only shown when this product is part of a look */}
        {hasPairings && hasLookbook && (
          <section className="py-8 border-b border-border/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[9px] font-bold tracking-[0.35em] text-accent uppercase select-none">Curated Looks</span>
                <h2 className="text-sm font-display font-medium text-text-primary uppercase tracking-[0.15em] mt-0.5">Shop the Look</h2>
              </div>
            </div>
            <ShopTheLookCarousel slides={lookbookData.slides} products={lookbookData.products} compact />
          </section>
        )}
        
        {/* 2. Product Hero: Split Editorial Layout */}
        <Section id="product-hero" padding="none" className="py-6 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 lg:gap-20 items-start">
            
            {/* ── Left Column: Product Gallery + Editorial Pair ── */}
            <div className="md:col-span-7 flex flex-col gap-4">
              <ProductGallery 
                images={product.productImages} 
                productName={product.name} 
                badge={product.badge}
              />
              <ProductEditorialPair
                images={product.productImages}
                productName={product.name}
              />
            </div>

             {/* ── Right Column: Product Information Panel ── */}
            <div className="md:col-span-5 flex flex-col items-start text-left pt-2">
              <Stack gap={5} className="w-full">
                
                {/* Headers */}
                <div className="flex flex-col gap-2.5">
                  {/* Category / Subcategory Label in small caps */}
                  <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase select-none">
                    {parentCategory 
                      ? `${parentCategory.name} / ${product.category?.name}` 
                      : product.category?.name || "CATALOGUE"}
                  </span>
                  
                  <h1 className="text-[2.25rem] font-display text-text-primary leading-tight tracking-tight uppercase font-light">
                    {product.name}
                  </h1>
                  <span className="text-body-sm text-text-secondary select-none">
                    {primaryMaterial}
                  </span>
                  <div className="pt-1">
                    <span className="inline-flex items-center text-[10px] font-bold tracking-widest text-text-primary uppercase border border-border rounded-xs px-2.5 py-1 bg-surface-elevated select-none">
                      {availabilityText}
                    </span>
                  </div>
                </div>

                {/* Variant Selectors, Price, Short Description, and Add To Cart */}
                <ProductVariantSelector 
                  productId={product.id}
                  variants={variantsWithPrices}
                  colors={colors}
                  sizes={sizes}
                  productName={product.name}
                  sizeGuide={product.sizeGuide}
                  shortDescription={product.shortDescription}
                  offSection={product.offSection}
                />

                {/* ── Trust Feature Grid: 24px below Buy Now ── */}
                <div className="-mt-3">
                  <ProductTrustGrid />
                </div>

                {/* ── Virtual Try-On Guide: only shown when prompt exists ── */}
                <ProductTryOnGuide
                  virtualTryonPrompt={product.virtualTryonPrompt}
                  productName={product.name}
                />

                {/* ── Instagram Card: only shown when URL exists ── */}
                <ProductInstagramCard instagramReelUrl={product.instagramReelUrl} />

                {/* Collapsible Accordion Block */}
                <div className="mt-2">
                  <ProductAccordion 
                    description={product.description}
                    details={product.details}
                    careGuide={product.careGuide}
                  />
                </div>

              </Stack>
            </div>
          </div>
        </Section>

        {/* Products in This Look — pairing carousel */}
        {hasPairings && (
          <ProductsInLook products={pairingProducts} />
        )}

        {/* 4. You May Also Love section */}
        {relatedProducts.length > 0 && (
          <Section id="related-products" padding="lg" className="border-t border-border/20">
            <Stack gap={10}>
              {/* Header */}
              <div className="flex items-center justify-between select-none">
                <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                  You May Also Love
                </h2>
                <Link
                  href="/collections"
                  className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase hover:text-text-primary transition-colors duration-200"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
                {relatedProducts.map((rel: any, idx: number) => {
                  const inStock = (rel.variants || []).length > 0
                    ? (rel.variants || []).some((v: any) => v.inventory ? v.inventory.quantity > 0 : true)
                    : true
                  return (
                    <ProductCard 
                      key={rel.id}
                      product={rel}
                      itemColors={[]}
                      itemSizes={[]}
                      priority={idx < 5}
                      inStock={inStock}
                      hideWishlist={false}
                      hideDiscountBadge={true}
                    />
                  )
                })}
              </div>
            </Stack>
          </Section>
        )}

        {/* 5. Recently Viewed */}
        <Section id="recently-viewed" padding="md" className="border-t border-border/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
            <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
              Current Object
            </span>
            <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
              <span className="text-text-primary font-bold cursor-default select-none">
                {product.name}
              </span>
            </div>
          </div>
        </Section>

      </Container>
    </main>
  )
}

