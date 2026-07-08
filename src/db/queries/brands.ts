/**
 * db/queries/brands.ts — XINVORA Brand Repository
 *
 * Business-oriented read queries for Brands.
 * Currently, XINVORA is the sole brand, but the schema natively supports
 * multi-brand catalog expansions.
 */

import "server-only"
import { eq } from "drizzle-orm"
import { db } from "../client"
import { brands } from "../schema"
import type { BrandSummary } from "./types"

/**
 * Fetch all brands, ordered alphabetically.
 * Used for future multi-brand landing pages or filtering sidebars.
 */
export async function findAllBrands(): Promise<BrandSummary[]> {
  const rows = await db.query.brands.findMany({
    orderBy: (b, { asc }) => [asc(b.name)],
    columns: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
    },
  })
  return rows
}

/**
 * Fetch a single brand by its URL slug.
 */
export async function findBrandBySlug(slug: string): Promise<BrandSummary | null> {
  const result = await db.query.brands.findFirst({
    where: eq(brands.slug, slug),
    columns: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
    },
  })
  return result ?? null
}
