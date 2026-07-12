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
import { eq, and, desc } from "drizzle-orm"
import { db } from "../client"
import { collections } from "../schema"
import type { CollectionWithProducts } from "./types"
import { findProductsByCollectionId, findProducts } from "./products"

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
  ["collection-by-slug"],
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
    const collection = await db.query.collections.findFirst({
      where: and(eq(collections.slug, slug), eq(collections.isActive, true)),
    })

    if (!collection) return null

    // Fetch child collections
    const children = await db.query.collections.findMany({
      where: and(eq(collections.parentId, collection.id), eq(collections.isActive, true)),
      orderBy: [desc(collections.sortOrder)],
    })

    // Fetch parent collection
    let parent = null
    if (collection.parentId) {
      parent = await db.query.collections.findFirst({
        where: eq(collections.id, collection.parentId),
      })
    }

    // Fetch products with filters
    const productsResult = await findProducts({
      collectionSlug: slug,
      colorSlugs: color ? [color] : undefined,
      sizeSlugs: size ? [size] : undefined,
      materialSlugs: material ? [material] : undefined,
      sort: sort as any,
      limit: limit || 24,
    })

    return {
      collection,
      children,
      parent,
      productsResult,
    }
  },
  ["collection-detail"],
  { tags: ["collections"], revalidate: 1800 }
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
