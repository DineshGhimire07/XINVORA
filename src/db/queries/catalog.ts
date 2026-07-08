/**
 * db/queries/catalog.ts — XINVORA Catalog Aggregation Queries
 *
 * Provides aggregated queries for pages that need data from multiple
 * domains at once, like the Homepage or unified Catalog navigation.
 */

import "server-only"
import { findFeaturedProducts, findLatestProducts } from "./products"
import { findHomepageCollections } from "./collections"
import type { HomepageCatalog } from "./types"

/**
 * Fetch all necessary data to render the homepage catalog sections
 * in a single parallel operation.
 */
export async function getHomepageCatalog(): Promise<HomepageCatalog> {
  const [featuredCollections, featuredProducts, newArrivals] = await Promise.all([
    findHomepageCollections(4),
    findFeaturedProducts(8),
    findLatestProducts(8),
  ])

  return {
    featuredCollections,
    featuredProducts,
    newArrivals,
  }
}
