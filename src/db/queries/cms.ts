import { db } from "@/db/client"
import { cmsPages, cmsSections, cmsBlocks, homepageSettings } from "@/db/schema/cms"
import { products, variants, priceBooks, priceBookEntries, collections } from "@/db/schema"
import { eq, and, isNull, inArray, desc } from "drizzle-orm"
import { unstable_cache } from "next/cache"

async function _findProductsByIdsInternal(ids: string[]) {
  if (!ids || ids.length === 0) return []

  const items = await db.query.products.findMany({
    where: and(
      eq(products.status, "PUBLISHED"),
      inArray(products.id, ids)
    ),
    with: {
      productImages: {
        orderBy: (img, { asc }) => [asc(img.position)],
        columns: { url: true, altText: true },
      },
      variants: {
        where: (v, { eq, and, isNull }) => and(eq(v.isActive, true), isNull(v.deletedAt)),
        with: {
          color: true,
          size: true,
          inventory: true,
        }
      }
    },
    columns: { id: true, slug: true, name: true },
  })

  // Fetch prices for items
  const productIds = items.map(i => i.id)
  let prices: any[] = []
  if (productIds.length > 0) {
    prices = await db
      .select({
        productId: variants.productId,
        price: priceBookEntries.price,
        compareAtPrice: priceBookEntries.compareAtPrice,
      })
      .from(variants)
      .innerJoin(priceBookEntries, eq(variants.id, priceBookEntries.variantId))
      .innerJoin(priceBooks, and(eq(priceBookEntries.priceBookId, priceBooks.id), eq(priceBooks.isDefault, true)))
      .where(and(inArray(variants.productId, productIds), isNull(variants.deletedAt), eq(variants.isActive, true)))
  }

  // Fetch Off Section overlay for these products
  const { findOffSectionByProductIds } = await import("./off-section")
  const offSectionMap = productIds.length > 0 ? await findOffSectionByProductIds(productIds) : new Map()

  const itemsWithPrices = items.map(item => {
    const itemPrices = prices.filter(p => p.productId === item.id)
    const lowestPrice = itemPrices.length > 0 ? Math.min(...itemPrices.map(p => p.price)) : null
    const compareAtPrice = itemPrices.length > 0 ? Math.min(...itemPrices.map(p => p.compareAtPrice).filter((p): p is number => p !== null)) : null
    const offData = offSectionMap.get(item.id)
    
    return {
      ...item,
      lowestPrice,
      compareAtPrice: compareAtPrice === Infinity || compareAtPrice === null ? null : compareAtPrice,
      offSection: offData ?? null,
    }
  })

  // Order rows exactly as in the ids array parameter
  const orderMap = new Map(ids.map((id, index) => [id, index]))
  return itemsWithPrices
    .sort((a, b) => {
      const indexA = orderMap.get(a.id) ?? 9999
      const indexB = orderMap.get(b.id) ?? 9999
      return indexA - indexB
    })
}

const _findProductsByIdsCached = unstable_cache(
  async (idsStr: string) => {
    const ids = JSON.parse(idsStr) as string[]
    return _findProductsByIdsInternal(ids)
  },
  ["products-by-ids-v2"],
  { tags: ["products"], revalidate: 1800 }
)

export async function findProductsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return []
  return _findProductsByIdsCached(JSON.stringify(ids))
}

async function _findRandomCatalogProductsInternal(limit = 24) {
  const items = await db.query.products.findMany({
    where: and(
      eq(products.status, "PUBLISHED"),
      isNull(products.deletedAt)
    ),
    with: {
      productImages: {
        orderBy: (img, { asc }) => [asc(img.position)],
        columns: { url: true, altText: true },
      },
      variants: {
        where: (v, { eq, and, isNull }) => and(eq(v.isActive, true), isNull(v.deletedAt)),
        with: {
          color: true,
          size: true,
          inventory: true,
        },
      },
    },
    columns: { id: true, slug: true, name: true },
  })

  if (items.length === 0) return []

  // Fetch prices for items
  const productIds = items.map((i) => i.id)
  let prices: any[] = []
  if (productIds.length > 0) {
    prices = await db
      .select({
        productId: variants.productId,
        price: priceBookEntries.price,
        compareAtPrice: priceBookEntries.compareAtPrice,
      })
      .from(variants)
      .innerJoin(priceBookEntries, eq(variants.id, priceBookEntries.variantId))
      .innerJoin(
        priceBooks,
        and(eq(priceBookEntries.priceBookId, priceBooks.id), eq(priceBooks.isDefault, true))
      )
      .where(
        and(
          inArray(variants.productId, productIds),
          isNull(variants.deletedAt),
          eq(variants.isActive, true)
        )
      )
  }

  // Fetch Off Section overlay
  const { findOffSectionByProductIds } = await import("./off-section")
  const offSectionMap =
    productIds.length > 0 ? await findOffSectionByProductIds(productIds) : new Map()

  const itemsWithPrices = items.map((item) => {
    const itemPrices = prices.filter((p) => p.productId === item.id)
    const lowestPrice =
      itemPrices.length > 0 ? Math.min(...itemPrices.map((p) => p.price)) : null
    const compareAtPrice =
      itemPrices.length > 0
        ? Math.min(
            ...itemPrices
              .map((p) => p.compareAtPrice)
              .filter((p): p is number => p !== null)
          )
        : null
    const offData = offSectionMap.get(item.id)

    return {
      ...item,
      lowestPrice,
      compareAtPrice:
        compareAtPrice === Infinity || compareAtPrice === null ? null : compareAtPrice,
      offSection: offData ?? null,
    }
  })

  // Fisher-Yates shuffle to mix products across all collections (cached per hour for stable browsing sessions)
  const shuffled = [...itemsWithPrices]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, limit)
}

const _findRandomCatalogProductsCached = unstable_cache(
  async (limit: number) => _findRandomCatalogProductsInternal(limit),
  ["random-catalog-products-v2"],
  { tags: ["products"], revalidate: 3600 }
)

export async function findRandomCatalogProducts(limit = 24) {
  return _findRandomCatalogProductsCached(limit)
}

async function _findCollectionsByIdsInternal(ids: string[]) {
  if (!ids || ids.length === 0) return []

  const items = await db.query.collections.findMany({
    where: and(
      eq(collections.isActive, true),
      isNull(collections.deletedAt),
      inArray(collections.id, ids)
    ),
    columns: { id: true, slug: true, name: true, imageUrl: true, imageMobileUrl: true },
  })

  // Order rows exactly as in the ids array parameter
  const orderMap = new Map(ids.map((id, index) => [id, index]))
  return items.sort((a, b) => {
    const indexA = orderMap.get(a.id) ?? 9999
    const indexB = orderMap.get(b.id) ?? 9999
    return indexA - indexB
  })
}

const _findCollectionsByIdsCached = unstable_cache(
  async (idsStr: string) => {
    const ids = JSON.parse(idsStr) as string[]
    return _findCollectionsByIdsInternal(ids)
  },
  ["collections-by-ids-v2"],
  { tags: ["collections"], revalidate: 1800 }
)

export async function findCollectionsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return []
  return _findCollectionsByIdsCached(JSON.stringify(ids))
}

async function _getHomepageCMSInternal() {
  const page = await db.query.cmsPages.findFirst({
    where: and(
      eq(cmsPages.slug, "home"),
      isNull(cmsPages.deletedAt)
    ),
    with: {
      sections: {
        with: {
          blocks: true,
        },
      },
    },
  })
  return page ?? null
}

const _getHomepageCMSCached = unstable_cache(
  async () => _getHomepageCMSInternal(),
  ["homepage-cms-v2"],
  { tags: ["cms"], revalidate: 1800 }
)

export async function getHomepageCMS() {
  return _getHomepageCMSCached()
}

export const getHomepageSettings = unstable_cache(
  async () => {
    const settingsQuery = await db.select().from(homepageSettings).limit(1)
    return settingsQuery.length > 0 ? settingsQuery[0] : null
  },
  ["homepage-settings-v2"],
  { tags: ["cms", "settings"], revalidate: 1800 }
)
