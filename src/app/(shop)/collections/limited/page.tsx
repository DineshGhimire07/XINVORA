import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import Image from "next/image"
import { ProductCard } from "@/components/storefront/ProductCard"
import { CollectionFilterToolbar } from "@/components/storefront/CollectionFilterToolbar"
import type { Metadata } from "next"
import { db } from "@/db/client"
import { collections, productCollections } from "@/db/schema"
import { or, eq } from "drizzle-orm"
import { findProducts } from "@/db/queries/products"
import { getFilterAttributes, findVariantCardMapByProductIds } from "@/db/queries/collections"

export const metadata: Metadata = buildMetadata({
  title: "Limited Edition | XINVORA",
  description: "Rare pieces in very limited quantities. Once it's gone, it's gone.",
})

export const revalidate = 3600

export default async function LimitedCollectionPage(props: {
  searchParams: Promise<{
    sort?: string
    color?: string
    size?: string
    material?: string
  }>
}) {
  const searchParams = await props.searchParams

  // 1. Look up the "limited" collection record directly (no cache)
  const limitedCollection = await db.query.collections.findFirst({
    where: or(
      eq(collections.slug, "limited"),
      eq(collections.slug, "limited-edition")
    ),
  })

  // 2. Fetch product IDs assigned to this collection via join (no cache)
  let collectionProductIds: string[] = []
  if (limitedCollection) {
    const rows = await db
      .select({ productId: productCollections.productId })
      .from(productCollections)
      .where(eq(productCollections.collectionId, limitedCollection.id))
    collectionProductIds = rows.map((r) => r.productId)
  }

  // 3. Fetch full product details — only collection-assigned products
  let products: any[] = []
  if (collectionProductIds.length > 0) {
    const result = await findProducts({
      collectionSlug: limitedCollection?.slug,
      sort: (searchParams.sort as any) || "newest",
      colorSlugs: searchParams.color ? [searchParams.color] : undefined,
      sizeSlugs: searchParams.size ? [searchParams.size] : undefined,
      materialSlugs: searchParams.material ? [searchParams.material] : undefined,
      limit: 48,
    })
    products = result.items
  }

  // 4. Batch query variant card info + lookup tables
  const productIds = products.map((p) => p.id)
  const [variantCardMap, { allColors, allSizes, allMaterials }] = await Promise.all([
    productIds.length > 0
      ? findVariantCardMapByProductIds(JSON.stringify(productIds))
      : Promise.resolve({} as Record<string, any>),
    getFilterAttributes(),
  ])

  // 5. Sort: in-stock products first, sold-out automatically move to the end
  const isProductInStock = (productId: string) =>
    variantCardMap[productId]?.inStock ?? true

  products.sort((a, b) => {
    const aInStock = isProductInStock(a.id) ? 0 : 1
    const bInStock = isProductInStock(b.id) ? 0 : 1
    return aInStock - bInStock
  })

  return (
    <main className="flex-1 bg-background pt-[72px] md:pt-20">
      {/* ── Unique LIMITED Hero ── */}
      {limitedCollection?.bannerUrl || limitedCollection?.bannerMobileUrl ? (
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[32/10] overflow-hidden bg-neutral-900">
          {limitedCollection.bannerUrl && (
            <Image
              src={limitedCollection.bannerUrl}
              alt="Limited Edition Desktop Banner"
              fill
              priority
              className={`object-cover object-center ${limitedCollection.bannerMobileUrl ? "hidden md:block" : "block"}`}
            />
          )}
          {(limitedCollection.bannerMobileUrl || limitedCollection.bannerUrl) && (
            <Image
              src={limitedCollection.bannerMobileUrl || limitedCollection.bannerUrl!}
              alt="Limited Edition Mobile Banner"
              fill
              priority
              className={`object-cover object-center ${limitedCollection.bannerMobileUrl ? "block md:hidden" : "hidden"}`}
            />
          )}
        </div>
      ) : (
        <section className="w-full bg-[#F3EFEA] border-b border-neutral-200/60 pt-14 pb-16 md:pt-20 md:pb-24 relative overflow-hidden select-none">
          <Container>
            <div className="flex flex-col items-start max-w-2xl gap-5">
              <span className="text-[10px] md:text-[11px] font-bold tracking-[0.28em] text-[#A3835B] uppercase">
                XINVORA — LIMITED EDITION
              </span>
              <h1 className="font-display font-light text-[3rem] sm:text-[4rem] md:text-[5.5rem] leading-[0.96] tracking-[-0.02em] text-[#1A1A1A]">
                Limited.<br />
                <span className="italic">Forever.</span>
              </h1>
              <div className="w-10 h-px bg-[#A3835B]/50 mt-1" />
              <p className="text-[13px] md:text-sm font-light text-neutral-500 leading-relaxed max-w-sm">
                Rare pieces in very limited quantities.<br />
                Once it&apos;s gone, it&apos;s gone.
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* ── Filter Toolbar ── */}
      <CollectionFilterToolbar
        slug="limited"
        totalItems={products.length}
        colors={allColors}
        sizes={allSizes}
        materials={allMaterials}
        activeSort={searchParams.sort}
        activeColor={searchParams.color}
        activeSize={searchParams.size}
        activeMaterial={searchParams.material}
      />

      {/* ── Product Grid ── */}
      <Section id="limited-grid" padding="none" className="bg-background py-1.5 w-full">
        {products.length === 0 ? (
          <Container className="py-24 text-center">
            <h2 className="text-display-xs font-display text-text-primary uppercase tracking-wider mb-3">
              No Limited Edition Items Yet
            </h2>
            <p className="text-body-sm text-text-secondary max-w-md mx-auto mb-6">
              Go to <strong>Admin Panel → Collections → Limited Edition</strong> and assign products to feature them here.
            </p>
            <Link
              href="/admin/collections"
              className="inline-block px-8 py-3 bg-text-primary text-background text-[10px] font-bold tracking-[0.2em] uppercase rounded-[6px]"
            >
              Open Admin Panel
            </Link>
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
                  product={product}
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
