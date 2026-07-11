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

export async function findActiveCollections() {
  return db.query.collections.findMany({
    where: eq(collections.isActive, true),
    orderBy: [desc(collections.sortOrder), desc(collections.publishedAt)],
  })
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
  { tags: ["collections"], revalidate: 3600 }
)

/**
 * Fetch a single collection by slug for the collection landing page.
 * Includes the first page of its associated products.
 */
export async function findCollectionBySlug(
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

import { cache } from "react"

const cachedCollectionDetail = cache(
  async (
    slug: string,
    sort?: string,
    color?: string,
    size?: string,
    material?: string,
    limit?: number
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

/**
 * Fetch collections suitable for the homepage hero/editorial sections.
 * Returns the most recently published active collections.
 */
export async function findHomepageCollections(limit = 4) {
  return db.query.collections.findMany({
    where: and(eq(collections.isActive, true)),
    limit,
    orderBy: [desc(collections.publishedAt)],
  })
}
