/**
 * db/queries/search.ts — XINVORA Catalog Search Engine
 *
 * Provides full-text product search using PostgreSQL's ILIKE operator.
 * No external search provider is required.
 *
 * SEARCH STRATEGY:
 * PostgreSQL ILIKE performs a case-insensitive substring scan across
 * multiple indexed columns. The search fan-out is:
 *   1. products.name          (primary — highest relevance)
 *   2. products.description   (secondary)
 *   3. brands.name            (through join)
 *   4. categories.name        (through join)
 *
 * PERFORMANCE:
 * - Only PUBLISHED products are searched.
 * - Results are capped by the limit parameter.
 * - For production scale (>100k products), this can be replaced with
 *   a PostgreSQL full-text search index (tsvector/tsquery) with zero
 *   API changes — only this file changes.
 *
 * CACHING:
 * - Search results are dynamic by nature (user-typed query).
 * - Callers should NOT cache search results globally.
 * - Debounce at the UI layer (useDebounce hook) before calling.
 */

import "server-only"
import { eq, and, or, ilike, sql, inArray } from "drizzle-orm"
import { db } from "../client"
import { products, categories, brands } from "../schema"
import type { SearchResponse, SearchResult } from "./types"

const DEFAULT_SEARCH_LIMIT = 12
const MAX_SEARCH_LIMIT = 50

/**
 * Search for products matching a query string.
 *
 * Searches across: product name, description, brand name, category name.
 * Returns results sorted by relevance (name match first, then description).
 *
 * @param query     The user's search string. Must be ≥ 1 character.
 * @param limit     Max results to return (capped at 50).
 * @returns         SearchResponse with results and metadata.
 */
export async function searchProducts(
  query: string,
  limit = DEFAULT_SEARCH_LIMIT
): Promise<SearchResponse> {
  const safeQuery = query.trim()
  if (!safeQuery) {
    return { results: [], query, totalCount: 0, hasMore: false }
  }

  const effectiveLimit = Math.min(limit, MAX_SEARCH_LIMIT)
  const pattern = `%${safeQuery}%`

  // ── Step 1: Resolve brand and category IDs matching the query ─────────────
  // We use native subqueries to avoid fetching and mapping large arrays of IDs.
  const brandSubquery = db.select({ id: brands.id }).from(brands).where(ilike(brands.name, pattern))
  const categorySubquery = db.select({ id: categories.id }).from(categories).where(ilike(categories.name, pattern)).limit(20)

  // ── Step 2: Build the WHERE clause ────────────────────────────────────────
  // Products that match on: name, description, OR belong to matching brand/category.
  const nameMatch = ilike(products.name, pattern)
  const descMatch = ilike(products.description, pattern)

  const whereConditions = [
    eq(products.status, "PUBLISHED"),
    or(
      nameMatch,
      descMatch,
      inArray(products.brandId, brandSubquery),
      inArray(products.categoryId, categorySubquery)
    ),
  ]

  // ── Step 3 & 4: Fetch results and count concurrently ──────────────────────
  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(and(...whereConditions)),
    db.query.products.findMany({
      where: and(...whereConditions),
      limit: effectiveLimit + 1,
      orderBy: [
        sql`CASE WHEN LOWER(${products.name}) LIKE ${`%${safeQuery.toLowerCase()}%`} THEN 0 ELSE 1 END`,
        sql`${products.createdAt} DESC`,
      ],
      columns: {
        id: true,
        slug: true,
        name: true,
        categoryId: true,
        status: true,
      },
      with: {
        category: {
          columns: { id: true, slug: true, name: true },
        },
        productImages: {
          where: (img, { eq }) => eq(img.position, 0),
          limit: 1,
          columns: { url: true, altText: true, position: true },
        },
      },
    })
  ])

  const totalCount = Number(countResult[0]?.count ?? 0)

  const hasMore = rows.length > effectiveLimit
  const results = (hasMore ? rows.slice(0, effectiveLimit) : rows) as unknown as SearchResult[]

  return {
    results,
    query: safeQuery,
    totalCount,
    hasMore,
  }
}

/**
 * Instant/typeahead search — returns a smaller result set faster.
 * Searches only product names for low-latency autocomplete suggestions.
 *
 * @param query   Partial search string.
 * @param limit   Max suggestions (default 6, max 10).
 */
export async function searchProductNames(
  query: string,
  limit = 6
): Promise<Pick<SearchResult, "id" | "slug" | "name">[]> {
  const safeQuery = query.trim()
  if (!safeQuery || safeQuery.length < 2) return []

  const effectiveLimit = Math.min(limit, 10)

  const rows = await db.query.products.findMany({
    where: and(
      eq(products.status, "PUBLISHED"),
      ilike(products.name, `%${safeQuery}%`)
    ),
    limit: effectiveLimit,
    columns: { id: true, slug: true, name: true, status: true, categoryId: true },
    orderBy: [sql`${products.name} ASC`],
  })

  return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name }))
}
