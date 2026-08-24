/**
 * db/queries/collections.ts — XINVORA Collection Repository
 *
 * Business-oriented read queries for editorial Collections.
 *
 * Collections are time-bound editorial groupings (e.g. "Summer 2026",
 * "The Linen Edit") that differ from Category taxonomy.
 * They power the Collections page and homepage editorial sections.
 */

import "server-only"
import { eq, and, desc, inArray, isNull } from "drizzle-orm"
import { db } from "../client"
import { collections, variants, colors, sizes, inventory } from "../schema"
import type { CollectionWithProducts } from "./types"
import { findProductsByCollectionId, findProducts } from "./products"

export type VariantCardInfo = {
  colors: { id: string; hexCode: string }[]
  sizes: { id: string; name: string }[]
  inStock: boolean
}

async function _findVariantCardMapInternal(productIds: string[]): Promise<Record<string, VariantCardInfo>> {
  if (!productIds || productIds.length === 0) return {}

  const rows = await db
    .select({
      productId: variants.productId,
      colorId: colors.id,
      colorName: colors.name,
      colorHex: colors.hexCode,
      sizeId: sizes.id,
      sizeName: sizes.name,
      inventoryQuantity: inventory.quantity,
    })
    .from(variants)
    .leftJoin(colors, eq(variants.colorId, colors.id))
    .leftJoin(sizes, eq(variants.sizeId, sizes.id))
    .leftJoin(inventory, eq(variants.id, inventory.variantId))
    .where(
      and(
        inArray(variants.productId, productIds),
        isNull(variants.deletedAt),
        eq(variants.isActive, true)
      )
    )

  const cardMap: Record<string, VariantCardInfo> = {}
  for (const pid of productIds) {
    const pRows = rows.filter((r) => r.productId === pid)
    const colMap = new Map<string, { id: string; hexCode: string }>()
    const sizeMap = new Map<string, { id: string; name: string }>()
    let hasStock = false

    for (const r of pRows) {
      if (r.colorId && r.colorHex && !colMap.has(r.colorId)) {
        colMap.set(r.colorId, { id: r.colorId, hexCode: r.colorHex })
      }
      if (r.sizeId && r.sizeName && !sizeMap.has(r.sizeId)) {
        sizeMap.set(r.sizeId, { id: r.sizeId, name: r.sizeName })
      }
      if (r.inventoryQuantity === null || r.inventoryQuantity > 0) {
        hasStock = true
      }
    }

    const sortedSizes = Array.from(sizeMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    )

    cardMap[pid] = {
      colors: Array.from(colMap.values()),
      sizes: sortedSizes,
      inStock: pRows.length === 0 || hasStock,
    }
  }

  return cardMap
}

export const findVariantCardMapByProductIds = unstable_cache(
  async (productIdsStr: string) => {
    const productIds = JSON.parse(productIdsStr) as string[]
    return _findVariantCardMapInternal(productIds)
  },
  ["variant-card-map-v1"],
  { tags: ["products", "inventory"], revalidate: 1800 }
)

async function _findActiveCollectionsInternal() {
  return db.query.collections.findMany({
    where: eq(collections.isActive, true),
    orderBy: [desc(collections.sortOrder), desc(collections.publishedAt)],
  })
}

const _findActiveCollectionsCached = unstable_cache(
  async () => _findActiveCollectionsInternal(),
  ["active-collections"],
  { tags: ["collections"], revalidate: 1800 }
)

export async function findActiveCollections() {
  return _findActiveCollectionsCached()
}

import { unstable_cache } from "next/cache"

export async function findHierarchicalCollections() {
  return _findHierarchicalCollectionsCached()
}

const _findHierarchicalCollectionsCached = unstable_cache(
  async () => {
    const allCollections = await findActiveCollections()

    // Build a tree
    const rootCollections = allCollections.filter(c => !c.parentId)
    const childCollections = allCollections.filter(c => c.parentId)

    return rootCollections.map(root => ({
      ...root,
      children: childCollections.filter(c => c.parentId === root.id),
    }))
  },
  ["hierarchical-collections"],
  { tags: ["collections"], revalidate: 1800 }
)

/**
 * Fetch a single collection by slug for the collection landing page.
 * Includes the first page of its associated products.
 */
async function _findCollectionBySlugInternal(
  slug: string,
  productLimit = 24
): Promise<CollectionWithProducts | null> {
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.slug, slug), eq(collections.isActive, true)),
  })

  if (!collection) return null

  const { items: products } = await findProductsByCollectionId(collection.id, {
    limit: productLimit,
  })

  return { ...collection, products }
}

const _findCollectionBySlugCached = unstable_cache(
  async (slug: string, productLimit: number) => {
    return _findCollectionBySlugInternal(slug, productLimit)
  },
  ["collection-by-slug-v4"],
  { tags: ["collections"], revalidate: 1800 }
)

export async function findCollectionBySlug(
  slug: string,
  productLimit = 24
): Promise<CollectionWithProducts | null> {
  return _findCollectionBySlugCached(slug, productLimit)
}

import { cache } from "react"

const _findCollectionDetailCached = unstable_cache(
  async (
    slug: string,
    sort: string,
    color: string,
    size: string,
    material: string,
    limit: number
  ) => {
    // Single query for the collection — no writes inside a cached read path
    // (writes cause ShareLock contention when multiple concurrent cache misses fire)
    const slugToLookup =
      slug === "limited-edition" ? "limited" : slug

    const collection = await db.query.collections.findFirst({
      where: and(eq(collections.slug, slugToLookup), eq(collections.isActive, true)),
    })

    if (!collection) return null

    // Fetch child collections, parent, and products in parallel to reduce latency
    const [children, parent, productsResult] = await Promise.all([
      db.query.collections.findMany({
        where: and(eq(collections.parentId, collection.id), eq(collections.isActive, true)),
        orderBy: [desc(collections.sortOrder)],
      }),
      collection.parentId
        ? db.query.collections.findFirst({
            where: eq(collections.id, collection.parentId),
          })
        : Promise.resolve(null),
      findProducts({
        collectionSlug: slugToLookup,
        colorSlugs: color ? [color] : undefined,
        sizeSlugs: size ? [size] : undefined,
        materialSlugs: material ? [material] : undefined,
        sort: sort as any,
        limit: limit || 24,
      }),
    ])

    const productIds = productsResult.items.map((p) => p.id)
    const variantCardMap = await _findVariantCardMapInternal(productIds)

    return {
      collection,
      children,
      parent: parent ?? null,
      productsResult,
      variantCardMap,
    }
  },
  ["collection-detail-v6"],
  { tags: ["collections", "products"], revalidate: 1800 }
)

const cachedCollectionDetail = cache(
  async (
    slug: string,
    sort?: string,
    color?: string,
    size?: string,
    material?: string,
    limit?: number
  ) => {
    return _findCollectionDetailCached(
      slug,
      sort || "",
      color || "",
      size || "",
      material || "",
      limit || 24
    )
  }
)

export async function findCollectionDetailBySlug(
  slug: string,
  filterParams: {
    sort?: string
    color?: string
    size?: string
    material?: string
    limit?: number
  } = {}
) {
  return cachedCollectionDetail(
    slug,
    filterParams.sort,
    filterParams.color,
    filterParams.size,
    filterParams.material,
    filterParams.limit
  )
}

const _findHomepageCollectionsCached = unstable_cache(
  async (limit: number) => {
    return db.query.collections.findMany({
      where: and(eq(collections.isActive, true)),
      limit,
      orderBy: [desc(collections.publishedAt)],
    })
  },
  ["homepage-collections"],
  { tags: ["collections"], revalidate: 1800 }
)

export async function findHomepageCollections(limit = 4) {
  return _findHomepageCollectionsCached(limit)
}

export const getFilterAttributes = unstable_cache(
  async () => {
    const { colors, sizes, materials } = await import("../schema")
    const [allColors, allSizes, allMaterials] = await Promise.all([
      db.select().from(colors),
      db.select().from(sizes),
      db.select().from(materials),
    ])
    return { allColors, allSizes, allMaterials }
  },
  ["filter-attributes"],
  { tags: ["attributes"], revalidate: 3600 }
)
