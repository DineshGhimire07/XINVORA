/**
 * db/queries/products.ts — XINVORA Product Repository
 *
 * Business-oriented read queries for the Product catalog.
 * Implements the Phase 4F high-performance Catalog Engine.
 */

import "server-only"
import { eq, and, desc, asc, gt, inArray, count, ilike, min, sql, type SQL, isNull } from "drizzle-orm"
import { db } from "../client"
import {
  products,
  categories,
  brands,
  productCollections,
  collections,
  variants,
  colors,
  sizes,
  inventory,
  productTags,
  tags,
  productMaterials,
  materials,
  priceBooks,
  priceBookEntries,
} from "../schema"
import type {
  ProductFull,
  ProductSummary,
  ProductSummaryWithPrice,
  CatalogFilterParams,
  PaginatedResult,
} from "./types"
import { unstable_cache } from "next/cache"

async function _findProductBySlugInternal(slug: string): Promise<ProductFull | null> {
  const decodedSlug = decodeURIComponent(slug)
  const result = await db.query.products.findFirst({
    where: and(eq(products.slug, decodedSlug), eq(products.status, "PUBLISHED")),
    with: {
      category: true,
      brand: true,
      productImages: {
        orderBy: (imgs, { asc }) => [asc(imgs.position)],
      },
      productMaterials: {
        with: {
          material: true,
        },
      },
      variants: {
        where: (v, { eq, and, isNull }) => and(eq(v.isActive, true), isNull(v.deletedAt)),
        with: {
          color: true,
          size: true,
          inventory: true,
          variantImages: {
            orderBy: (imgs, { asc }) => [asc(imgs.position)],
          },
        },
      },
    },
  })
  return (result as ProductFull) ?? null
}

const _findProductBySlugCached = unstable_cache(
  async (slug: string) => _findProductBySlugInternal(slug),
  ["product-by-slug"],
  { tags: ["products"], revalidate: 1800 }
)

export async function findProductBySlug(slug: string): Promise<ProductFull | null> {
  return _findProductBySlugCached(slug)
}

/**
 * The Unified Catalog Engine.
 * Fetches a paginated list of products with complex filtering and sorting.
 * Ensures zero N+1 queries by using Drizzle's relational queries and subqueries for filters.
 */
async function _findProductsInternal(
  params: CatalogFilterParams = {}
): Promise<PaginatedResult<ProductSummaryWithPrice>> {
  const {
    limit = 24,
    cursor,
    status = "PUBLISHED",
    categorySlug,
    brandSlug,
    collectionSlug,
    colorSlugs,
    sizeSlugs,
    tagSlugs,
    materialSlugs,
    availability,
    sort = "newest",
    withCount = false,
  } = params

  const conditions = [eq(products.status, status)]

  // ── 1. Taxonomy Filters ───────────────────────────────────────────────────

  if (categorySlug) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
      columns: { id: true },
    })
    if (category) {
      conditions.push(eq(products.categoryId, category.id))
    } else {
      return emptyResult(withCount)
    }
  }

  if (brandSlug) {
    const brand = await db.query.brands.findFirst({
      where: eq(brands.slug, brandSlug),
      columns: { id: true },
    })
    if (brand) {
      conditions.push(eq(products.brandId, brand.id))
    } else {
      return emptyResult(withCount)
    }
  }

  if (collectionSlug) {
    const collection = await db.query.collections.findFirst({
      where: eq(collections.slug, collectionSlug),
      columns: { id: true },
    })
    if (collection) {
      const subquery = db
        .select({ productId: productCollections.productId })
        .from(productCollections)
        .where(eq(productCollections.collectionId, collection.id))
      
      conditions.push(inArray(products.id, subquery))
    } else {
      return emptyResult(withCount)
    }
  }

  // ── 2. Attribute Filters (Colors, Sizes, Tags, Materials) ─────────────────

  if (colorSlugs && colorSlugs.length > 0) {
    const subquery = db
      .select({ productId: variants.productId })
      .from(variants)
      .innerJoin(colors, eq(variants.colorId, colors.id))
      .where(and(inArray(sql`lower(${colors.name})`, colorSlugs.map(s => s.toLowerCase())), isNull(variants.deletedAt))) // fallback assuming name acts as slug, or fix schema
    conditions.push(inArray(products.id, subquery))
  }

  if (sizeSlugs && sizeSlugs.length > 0) {
    const subquery = db
      .select({ productId: variants.productId })
      .from(variants)
      .innerJoin(sizes, eq(variants.sizeId, sizes.id))
      .where(and(inArray(sql`lower(${sizes.name})`, sizeSlugs.map(s => s.toLowerCase())), isNull(variants.deletedAt)))
    conditions.push(inArray(products.id, subquery))
  }

  if (tagSlugs && tagSlugs.length > 0) {
    const subquery = db
      .select({ productId: productTags.productId })
      .from(productTags)
      .innerJoin(tags, eq(productTags.tagId, tags.id))
      .where(inArray(sql`lower(${tags.slug})`, tagSlugs.map(s => s.toLowerCase())))
    conditions.push(inArray(products.id, subquery))
  }

  if (materialSlugs && materialSlugs.length > 0) {
    const subquery = db
      .select({ productId: productMaterials.productId })
      .from(productMaterials)
      .innerJoin(materials, eq(productMaterials.materialId, materials.id))
      .where(inArray(sql`lower(${materials.name})`, materialSlugs.map(s => s.toLowerCase())))
    conditions.push(inArray(products.id, subquery))
  }

  // ── 3. Availability Filter ────────────────────────────────────────────────

  if (availability && availability !== "all") {
    const statusVal = availability === "in_stock" ? "IN_STOCK" : "LOW_STOCK"
    const subquery = db
      .select({ productId: variants.productId })
      .from(variants)
      .innerJoin(inventory, eq(variants.id, inventory.variantId))
      .where(and(eq(inventory.status, statusVal), isNull(variants.deletedAt)))
    conditions.push(inArray(products.id, subquery))
  }

  // ── 3.5. Full Text Search ──────────────────────────────────────────────────

  if (params.searchQuery) {
    // Escape LIKE special characters to prevent wildcard injection
    const escapedQuery = params.searchQuery.replace(/[%_\\]/g, '\\$&')
    conditions.push(ilike(products.name, `%${escapedQuery}%`))
  }

  // ── 4. Cursor Pagination ──────────────────────────────────────────────────

  if (cursor) {
    if (sort === "newest") {
       conditions.push(gt(products.id, cursor))
    }
  }

  // ── 5 & 6. Sorting, Fetch & Count (Parallelized) ─────────────────────────

  let totalCount: number | undefined = undefined
  let orderBy: SQL[] = [desc(products.createdAt)]
  let orderedProductIds: string[] | null = null

  if (sort === "price_asc" || sort === "price_desc") {
    const orderDir = sort === "price_asc" ? asc(sql`lowest_price`) : desc(sql`lowest_price`)
    // Query product IDs matching the conditions concurrently with the total count
    const idRowsPromise = db
      .select({ 
        productId: products.id,
        lowestPrice: min(priceBookEntries.price).as("lowest_price")
      })
      .from(products)
      .leftJoin(variants, and(eq(products.id, variants.productId), isNull(variants.deletedAt)))
      .leftJoin(priceBookEntries, eq(variants.id, priceBookEntries.variantId))
      .leftJoin(priceBooks, and(eq(priceBookEntries.priceBookId, priceBooks.id), eq(priceBooks.isDefault, true)))
      .where(and(...conditions))
      .groupBy(products.id)
      .orderBy(orderDir)
      .limit(limit + 1)

    const countPromise = withCount
      ? db
          .select({ val: count() })
          .from(products)
          .where(and(...conditions))
      : Promise.resolve(null)

    const [idRows, countRes] = await Promise.all([idRowsPromise, countPromise])

    if (countRes) {
      totalCount = countRes[0]?.val ?? 0
    }
    orderedProductIds = idRows.map(r => r.productId)
    if (orderedProductIds.length === 0) return emptyResult(withCount)
  } else {
    switch (sort) {
      case "oldest":
        orderBy = [asc(products.createdAt)]
        break
      case "name_asc":
        orderBy = [asc(products.name)]
        break
      case "name_desc":
        orderBy = [desc(products.name)]
        break
      case "featured":
      case "newest":
      default:
        orderBy = [desc(products.createdAt)]
        break
    }
  }

  let rows: any[] = []
  if (orderedProductIds) {
    // For price-sort, fetch details for the resolved IDs
    rows = await db.query.products.findMany({
      where: inArray(products.id, orderedProductIds),
      with: {
        category: {
          columns: { id: true, slug: true, name: true },
        },
        productImages: {
          orderBy: (img, { asc }) => [asc(img.position)],
          columns: { url: true, altText: true, position: true },
        },
      },
      columns: { id: true, slug: true, name: true, status: true, categoryId: true },
    })
    // Sort rows to match orderedProductIds exactly
    rows.sort((a, b) => orderedProductIds!.indexOf(a.id) - orderedProductIds!.indexOf(b.id))
  } else {
    // For standard sort, fetch rows and count concurrently
    const countPromise = withCount
      ? db
          .select({ val: count() })
          .from(products)
          .where(and(...conditions))
      : Promise.resolve(null)

    const rowsPromise = db.query.products.findMany({
      where: and(...conditions),
      limit: limit + 1,
      orderBy,
      with: {
        category: {
          columns: { id: true, slug: true, name: true },
        },
        productImages: {
          orderBy: (img, { asc }) => [asc(img.position)],
          columns: { url: true, altText: true, position: true },
        },
      },
      columns: { id: true, slug: true, name: true, status: true, categoryId: true },
    })

    const [countRes, fetchedRows] = await Promise.all([countPromise, rowsPromise])
    if (countRes) {
      totalCount = countRes[0]?.val ?? 0
    }
    rows = fetchedRows
  }

  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null

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

  const itemsWithPrices = items.map(item => {
    const itemPrices = prices.filter(p => p.productId === item.id)
    const lowestPrice = itemPrices.length > 0 ? Math.min(...itemPrices.map(p => p.price)) : null
    const compareAtPrice = itemPrices.length > 0 ? Math.min(...itemPrices.map(p => p.compareAtPrice).filter((p): p is number => p !== null)) : null
    
    return {
      ...item,
      lowestPrice,
      compareAtPrice: compareAtPrice === Infinity || compareAtPrice === null ? null : compareAtPrice,
    }
  })

  return {
    items: itemsWithPrices as unknown as ProductSummaryWithPrice[],
    nextCursor,
    prevCursor: null,
    hasMore,
    totalCount,
  }
}

const _findProductsCached = unstable_cache(
  async (paramsStr: string) => {
    const params = JSON.parse(paramsStr) as CatalogFilterParams
    return _findProductsInternal(params)
  },
  ["products-catalog"],
  { tags: ["products"], revalidate: 1800 }
)

export async function findProducts(
  params: CatalogFilterParams = {}
): Promise<PaginatedResult<ProductSummaryWithPrice>> {
  return _findProductsCached(JSON.stringify(params))
}

function emptyResult(withCount: boolean): PaginatedResult<ProductSummaryWithPrice> {
  return {
    items: [],
    nextCursor: null,
    prevCursor: null,
    hasMore: false,
    ...(withCount ? { totalCount: 0 } : {}),
  }
}

/**
 * Fetch products tagged as featured for homepage.
 */
export async function findFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  const { items } = await findProducts({ limit, sort: "featured" })
  return items
}

/**
 * Fetch the most recently published products for "New Arrivals".
 */
export async function findLatestProducts(limit = 8): Promise<ProductSummary[]> {
  const { items } = await findProducts({ limit, sort: "newest" })
  return items
}

async function _findRelatedProductsInternal(
  categoryId: string,
  excludeProductId: string,
  limit = 4
): Promise<ProductSummary[]> {
  // Manual query for specific exclusion
  const rows = await db.query.products.findMany({
    where: and(
      eq(products.status, "PUBLISHED"),
      eq(products.categoryId, categoryId)
    ),
    limit: limit + 1,
    orderBy: [desc(products.createdAt)],
    with: {
      category: { columns: { id: true, slug: true, name: true } },
      productImages: {
        orderBy: (img, { asc }) => [asc(img.position)],
        columns: { url: true, altText: true, position: true },
      },
    },
    columns: { id: true, slug: true, name: true, status: true, categoryId: true },
  })

  return rows
    .filter((p) => p.id !== excludeProductId)
    .slice(0, limit) as unknown as ProductSummary[]
}

const _findRelatedProductsCached = unstable_cache(
  async (categoryId: string, excludeProductId: string, limit: number) => {
    return _findRelatedProductsInternal(categoryId, excludeProductId, limit)
  },
  ["related-products"],
  { tags: ["products"], revalidate: 1800 }
)

export async function findRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4
): Promise<ProductSummary[]> {
  return _findRelatedProductsCached(categoryId, excludeProductId, limit)
}

async function _findProductsByCollectionIdInternal(
  collectionId: string,
  params: CatalogFilterParams = {}
): Promise<PaginatedResult<ProductSummary>> {
  const collection = await db.query.collections.findFirst({
    where: eq(collections.id, collectionId),
    columns: { slug: true }
  })
  
  if (!collection) return emptyResult(params.withCount ?? false)
  
  return findProducts({ ...params, collectionSlug: collection.slug })
}

const _findProductsByCollectionIdCached = unstable_cache(
  async (collectionId: string, paramsStr: string) => {
    const params = JSON.parse(paramsStr) as CatalogFilterParams
    return _findProductsByCollectionIdInternal(collectionId, params)
  },
  ["products-by-collection-id"],
  { tags: ["products"], revalidate: 1800 }
)

export async function findProductsByCollectionId(
  collectionId: string,
  params: CatalogFilterParams = {}
): Promise<PaginatedResult<ProductSummary>> {
  return _findProductsByCollectionIdCached(collectionId, JSON.stringify(params))
}

/**
 * Fetch all products for the admin panel (includes all statuses).
 * Uses offset pagination for standard data tables.
 */
export async function findAdminProductsPaginated(
  options: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: "createdAt" | "name"
    sortOrder?: "asc" | "desc"
  } = {}
) {
  const page = options.page || 1
  const limit = options.limit || 20
  const offset = (page - 1) * limit

  const conditions: any[] = [isNull(products.deletedAt)]

  if (options.status) {
    conditions.push(eq(products.status, options.status as any))
  }

  if (options.search) {
    conditions.push(ilike(products.name, `%${options.search}%`))
  }

  const { priceBookEntries } = await import("../schema/price-book-entries")
  const { priceBooks } = await import("../schema/price-books")
  const { variants } = await import("../schema/variants")
  const { inventory } = await import("../schema/inventory")
  const { categories } = await import("../schema/categories")

  const baseQuery = db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      status: products.status,
      createdAt: products.createdAt,
      categoryName: categories.name,
      price: sql<number>`coalesce((
        select min(${priceBookEntries.price}) 
        from ${variants} 
        inner join ${priceBookEntries} on ${variants.id} = ${priceBookEntries.variantId}
        inner join ${priceBooks} on ${priceBookEntries.priceBookId} = ${priceBooks.id}
        where ${variants.productId} = ${products.id} and ${priceBooks.isDefault} = true
      ), 0)`,
      stock: sql<number>`coalesce((
        select sum(${inventory.quantity}) 
        from ${variants} 
        inner join ${inventory} on ${variants.id} = ${inventory.variantId}
        where ${variants.productId} = ${products.id}
      ), 0)`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))

  const sortCol = options.sortBy === "name" ? products.name : products.createdAt
  const orderDirection = options.sortOrder === "asc" ? sortCol : desc(sortCol)

  const [items, countResult] = await Promise.all([
    baseQuery
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions))
  ])

  const total = Number(countResult[0]?.count ?? 0)

  const { productImages } = await import("../schema/product-images")
  const itemIds = items.map(item => item.id)
  const images = itemIds.length > 0 
    ? await db
        .select()
        .from(productImages)
        .where(and(inArray(productImages.productId, itemIds), eq(productImages.position, 1)))
    : []

  const itemsWithImages = items.map(item => ({
    ...item,
    productImages: images.filter(img => img.productId === item.id)
  }))

  return {
    items: itemsWithImages,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}
