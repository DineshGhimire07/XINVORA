/**
 * db/queries/categories.ts — XINVORA Category Repository
 *
 * Business-oriented read queries for the Category taxonomy.
 *
 * Categories power:
 *  - Navigation menus (top-level categories)
 *  - PLP filtering sidebar
 *  - Breadcrumb resolution
 */

import "server-only"
import { eq, isNull, and } from "drizzle-orm"
import { db } from "../client"
import { categories } from "../schema"
import type { CategoryNode } from "./types"

/**
 * Fetch all top-level (root) categories for main navigation.
 * Root categories have no parent (parentId IS NULL).
 */
export async function findRootCategories(): Promise<CategoryNode[]> {
  const rows = await db.query.categories.findMany({
    where: and(isNull(categories.parentId), eq(categories.isActive, true)),
    orderBy: (c, { asc }) => [asc(c.name)],
  })
  return rows
}

/**
 * Fetch a single category by its URL slug.
 * Returns null if no active category with that slug exists.
 */
export async function findCategoryBySlug(slug: string): Promise<CategoryNode | null> {
  const result = await db.query.categories.findFirst({
    where: and(eq(categories.slug, slug), eq(categories.isActive, true)),
  })
  return result ?? null
}

import { unstable_cache } from "next/cache"

/**
 * Fetch the complete category tree for building nested navigation menus.
 *
 * Fetches all active categories in a single query, then assembles the
 * hierarchy in application memory. This is more efficient than recursive
 * SQL (CTEs) for typical fashion taxonomies which rarely exceed 200 nodes.
 *
 * Cached with tag-based invalidation ("categories") + 1-hour time fallback.
 * Admin mutations call revalidateTag("categories") to bust this immediately.
 */
export async function findCategoryTree(): Promise<CategoryNode[]> {
  return _findCategoryTreeCached()
}

const _findCategoryTreeCached = unstable_cache(
  async (): Promise<CategoryNode[]> => {
    const all = await db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: (c, { asc }) => [asc(c.name)],
    })

    const nodeMap = new Map<string, CategoryNode>()
    const roots: CategoryNode[] = []

    for (const cat of all) {
      nodeMap.set(cat.id, { ...cat, children: [] })
    }

    for (const cat of all) {
      // Non-null assertion justified: we just inserted every `cat.id` in the loop above
      const node = nodeMap.get(cat.id)!
      if (cat.parentId && nodeMap.has(cat.parentId)) {
        // Non-null assertion justified: parentId existence verified by nodeMap.has()
        nodeMap.get(cat.parentId)!.children!.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  },
  ["category-tree"],
  { tags: ["categories"], revalidate: 3600 }
)
