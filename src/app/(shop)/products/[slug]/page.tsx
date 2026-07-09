/**
 * app/products/[slug]/page.tsx — XINVORA Product Detail Experience
 *
 * Implements the premium Product Detail Page using live catalog data.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

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
import { SessionService } from "@/services/session.service"
import { getWishlist } from "@/db/queries/wishlist"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { findProductBySlug, findProducts } from "@/db/queries"
import type { Metadata } from "next"
import { db } from "@/db/client"
import { priceBookEntries, priceBooks, categories } from "@/db/schema"
import { and, eq, inArray } from "drizzle-orm"

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
  const product = await findProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const session = await SessionService.optionalAuth()
  let wishlistVariantIds: string[] = []
  if (session) {
    const wishlist = await getWishlist(session.id)
    if (wishlist) {
      wishlistVariantIds = wishlist.items.map((item) => item.variant.id)
    }
  }

  // Load parent category if exists
  let parentCategory = null
  if (product.category?.parentId) {
    parentCategory = await db.query.categories.findFirst({
      where: eq(categories.id, product.category.parentId)
    })
  }

  // Load related products based on the current product's category slug
  const relatedResponse = product.category?.slug
    ? await findProducts({ categorySlug: product.category.slug, limit: 6 })
    : { items: [] }

  const relatedProducts = relatedResponse.items
    .filter((p) => p.id !== product.id)
    .slice(0, 5)

  // Resolve active variants, colors, and sizes
  const activeVariants = product.variants.filter(v => v.isActive)

  // Query prices for these active variants
  const variantIds = activeVariants.map((v) => v.id)
  let variantPrices: any[] = []
  if (variantIds.length > 0) {
    variantPrices = await db
      .select({
        variantId: priceBookEntries.variantId,
        price: priceBookEntries.price,
      })
      .from(priceBookEntries)
      .innerJoin(priceBooks, and(eq(priceBookEntries.priceBookId, priceBooks.id), eq(priceBooks.isDefault, true)))
      .where(inArray(priceBookEntries.variantId, variantIds))
  }

  const variantsWithPrices = activeVariants.map((v) => {
    const p = variantPrices.find((vp) => vp.variantId === v.id)
    return {
      ...v,
      price: p ? p.price : null,
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

  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        
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
                  variants={variantsWithPrices}
                  colors={colors}
                  sizes={sizes}
                  productName={product.name}
                  sizeGuide={product.sizeGuide}
                  shortDescription={product.shortDescription}
                  initialWishlistVariantIds={wishlistVariantIds}
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

              {/* Grid Layout (5 columns on desktop) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
                {relatedProducts.map((rel: any) => (
                  <div key={rel.id} className="group flex flex-col gap-4 text-left relative">
                    {/* Visual Card Image container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-transparent flex items-center justify-center border border-border/10">
                      
                      {/* Wishlist Toggle Heart Icon top-right */}
                      <WishlistToggleIcon productId={rel.id} />
                      
                      <div className="flex w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {rel.productImages?.length ? (
                          rel.productImages.map((img: any, i: number) => (
                            <div key={i} className="relative w-full h-full shrink-0 snap-start">
                              <Image
                                src={img.url}
                                alt={img.altText || rel.name}
                                fill
                                sizes="(max-width: 768px) 50vw, 20vw"
                                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="w-full h-full bg-surface-secondary/20 flex items-center justify-center text-[10px] text-text-secondary uppercase select-none">
                            No Image
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata details */}
                    <Link href={`/products/${rel.slug}`} className="flex flex-col gap-1.5 mt-2">
                      <h3 className="text-[13px] font-display font-medium tracking-wide text-text-primary group-hover:text-text-primary/70 transition-colors duration-200 uppercase">
                        {rel.name}
                      </h3>
                      <span className="font-semibold select-none font-mono text-[11px] text-text-primary/90">
                        {rel.lowestPrice !== null && rel.lowestPrice !== undefined
                          ? `NPR ${Math.round(rel.lowestPrice / 100).toLocaleString()}`
                          : "Contact for Price"}
                      </span>
                    </Link>
                  </div>
                ))}
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

