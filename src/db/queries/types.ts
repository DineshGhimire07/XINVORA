/**
 * db/queries/types.ts — XINVORA Repository Shared Types
 *
 * Every repository method returns types defined here.
 * This module is the contract between the Repository Layer
 * and the Application/Service layers above it.
 *
 * Consumers import types from "@/db/queries/types" — not from Drizzle.
 *
 * Phase 4F additions:
 *   - CatalogFilterParams (unified filter shape)
 *   - SortField (all supported sort orders)
 *   - PriceRange, AvailabilityFilter
 *   - ProductSummaryWithPrice
 *   - SearchResult, SearchResponse
 *   - HomepageCatalog, CollectionWithCount, CategoryWithCount
 */

import type { InferSelectModel } from "drizzle-orm"
import type {
  products,
  variants,
  inventory,
  productImages,
  variantImages,
  categories,
  collections,
  brands,
  colors,
  sizes,
  tags,
  materials,
  carts,
  cartItems,
  wishlists,
  wishlistItems,
} from "../schema"

// ── Raw inferred types (private to the db layer) ───────────────────────────
type RawProduct = InferSelectModel<typeof products>
type RawVariant = InferSelectModel<typeof variants>
type RawInventory = InferSelectModel<typeof inventory>
type RawProductImage = InferSelectModel<typeof productImages>
type RawVariantImage = InferSelectModel<typeof variantImages>
type RawCategory = InferSelectModel<typeof categories>
type RawCollection = InferSelectModel<typeof collections>
type RawBrand = InferSelectModel<typeof brands>
type RawColor = InferSelectModel<typeof colors>
type RawSize = InferSelectModel<typeof sizes>
type RawTag = InferSelectModel<typeof tags>
type RawMaterial = InferSelectModel<typeof materials>

// ── Public Domain Types ─────────────────────────────────────────────────────

/** A fully resolved product with its images, variants, and variant images. */
export type ProductFull = RawProduct & {
  category: RawCategory
  brand: RawBrand | null
  productImages: RawProductImage[]
  productMaterials?: {
    material: RawMaterial
  }[]
  variants: (RawVariant & {
    color: RawColor | null
    size: RawSize | null
    inventory: RawInventory | null
    variantImages: RawVariantImage[]
  })[]
}

/** A lightweight product used for listing pages (PLP). */
export type ProductSummary = Pick<
  RawProduct,
  "id" | "slug" | "name" | "status" | "categoryId"
> & {
  category: Pick<RawCategory, "id" | "slug" | "name">
  productImages: Pick<RawProductImage, "url" | "altText" | "position">[]
}

/** ProductSummary enriched with the lowest available price from the default price book. */
export type ProductSummaryWithPrice = ProductSummary & {
  /** Price in minor units (cents). Null when no price book entry exists. */
  lowestPrice: number | null
  /** Compare-at price in minor units (cents) for sale display. */
  compareAtPrice: number | null
}

/** A single Category node, optionally with its children. */
export type CategoryNode = RawCategory & {
  children?: RawCategory[]
}

/** Category with a product count. */
export type CategoryWithCount = RawCategory & {
  productCount: number
}

/** A Collection with its associated products (summaries). */
export type CollectionWithProducts = RawCollection & {
  products: ProductSummary[]
}

/** Collection enriched with product count. */
export type CollectionWithCount = RawCollection & {
  productCount: number
}

/** A Brand with basic info. */
export type BrandSummary = Pick<
  RawBrand,
  "id" | "slug" | "name" | "logoUrl"
>

/** A color option for filter UI. */
export type ColorOption = Pick<RawColor, "id" | "name" | "hexCode">

/** A size option for filter UI. */
export type SizeOption = Pick<RawSize, "id" | "name" | "abbreviation" | "category">

/** A tag for facet filtering. */
export type TagOption = Pick<RawTag, "id" | "name" | "slug">

/** A material for facet filtering. */
export type MaterialOption = Pick<RawMaterial, "id" | "name">

// ── Pagination ────────────────────────────────────────────────────────────────

/** Pagination parameters for list queries. */
export interface PaginationParams {
  limit?: number
  /** Forward cursor: id of the last item on the previous page. */
  cursor?: string
}

/** Standardized paginated result. */
export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  prevCursor: string | null
  hasMore: boolean
  /** Total count when requested. Expensive — opt-in only via withCount. */
  totalCount?: number
}

// ── Sorting ───────────────────────────────────────────────────────────────────

/**
 * Supported sort fields for the catalog engine.
 * UI components map display labels to these values via URL params.
 */
export type SortField =
  | "newest"     // createdAt DESC (default)
  | "oldest"     // createdAt ASC
  | "name_asc"   // name ASC
  | "name_desc"  // name DESC
  | "price_asc"  // price ASC
  | "price_desc" // price DESC
  | "featured"   // PUBLISHED, createdAt DESC (editor curated — no dedicated DB flag yet)

// ── Filtering ─────────────────────────────────────────────────────────────────

/**
 * Availability filter values.
 * Maps to inventory.status column values.
 */
export type AvailabilityFilter = "in_stock" | "low_stock" | "all"

/**
 * Price range filter (values in minor units / cents).
 */
export interface PriceRange {
  min?: number
  max?: number
}

/**
 * CatalogFilterParams — the single unified filter shape for every product
 * listing page in the storefront.
 *
 * All fields are optional. Omitting them returns all PUBLISHED products.
 * This is the canonical filter type for Phase 4F+. ProductFilterParams is
 * kept only for Phase 4D backward compatibility.
 */
export interface CatalogFilterParams extends PaginationParams {
  // ── Taxonomy ──────────────────────────────────────────────────────────────
  categorySlug?: string
  collectionSlug?: string
  brandSlug?: string

  // ── Attribute facets (by slug) ────────────────────────────────────────────
  colorSlugs?: string[]
  sizeSlugs?: string[]
  tagSlugs?: string[]
  materialSlugs?: string[]

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  status?: "PUBLISHED" | "DRAFT" | "ARCHIVED"

  // ── Availability ──────────────────────────────────────────────────────────
  availability?: AvailabilityFilter

  // ── Sorting ───────────────────────────────────────────────────────────────
  sort?: SortField

  // ── Full-text search ──────────────────────────────────────────────────────
  searchQuery?: string

  // ── Meta ──────────────────────────────────────────────────────────────────
  /** Include total count. Adds an extra COUNT(*) query — use on first page only. */
  withCount?: boolean
}

/**
 * @deprecated Use CatalogFilterParams instead.
 * Kept for backward compatibility with Phase 4D query signatures.
 */
export interface ProductFilterParams extends PaginationParams {
  categorySlug?: string
  collectionSlug?: string
  brandSlug?: string
  status?: "PUBLISHED" | "DRAFT" | "ARCHIVED"
  isActive?: boolean
}

// ── Search ────────────────────────────────────────────────────────────────────

/** A lightweight search result item. */
export type SearchResult = Pick<RawProduct, "id" | "slug" | "name" | "categoryId"> & {
  category: Pick<RawCategory, "id" | "slug" | "name">
  productImages: Pick<RawProductImage, "url" | "altText" | "position">[]
  matchedOn?: "name" | "brand" | "category" | "description"
}

/** Structured search response. */
export interface SearchResponse {
  results: SearchResult[]
  query: string
  totalCount: number
  hasMore: boolean
}

// ── Homepage Catalog ──────────────────────────────────────────────────────────

/** Aggregated data needed to render the homepage catalog sections. */
export interface HomepageCatalog {
  featuredCollections: RawCollection[]
  featuredProducts: ProductSummary[]
  newArrivals: ProductSummary[]
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

/** A single breadcrumb segment. */
export interface BreadcrumbItem {
  label: string
  href: string
}

// ── Cart & Wishlist ───────────────────────────────────────────────────────────

export type RawCart = InferSelectModel<typeof carts>
export type RawCartItem = InferSelectModel<typeof cartItems>
export type RawWishlist = InferSelectModel<typeof wishlists>
export type RawWishlistItem = InferSelectModel<typeof wishlistItems>

export interface CartItemResult extends RawCartItem {
  variant: Pick<RawVariant, "id" | "sku"> & {
    product: Pick<RawProduct, "id" | "name" | "slug" | "categoryId">
    color: Pick<RawColor, "name"> | null
    size: Pick<RawSize, "name"> | null
    images: Pick<RawVariantImage, "url" | "altText">[]
  }
  price: number // live price in cents
  /** Sibling variants of the same product for inline size swapping */
  siblingVariants: {
    id: string
    size: Pick<RawSize, "name" | "abbreviation"> | null
    inStock: boolean
  }[]
}

export interface CartResult extends RawCart {
  items: CartItemResult[]
}

export interface WishlistItemResult extends RawWishlistItem {
  variant: Pick<RawVariant, "id" | "sku"> & {
    product: Pick<RawProduct, "id" | "name" | "slug">
    color: Pick<RawColor, "name"> | null
    size: Pick<RawSize, "name"> | null
    images: Pick<RawVariantImage, "url" | "altText">[]
  }
  price: number | null // live price in cents
}

export interface WishlistResult extends RawWishlist {
  items: WishlistItemResult[]
}

export interface HeaderCommerceState {
  cartCount: number
  wishlistCount: number
}
