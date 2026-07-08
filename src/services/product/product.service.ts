/**
 * services/product/product.service.ts — XINVORA Product Write Service
 *
 * Owns ALL business rules for creating, updating, and archiving products.
 *
 * STATUS: Architecture stub.
 * The method signatures, input/output types, and transaction boundaries are
 * fully defined here. Implementations will be filled in when the Admin
 * Dashboard (Phase 6+) provides the UI that can invoke these writes.
 *
 * WHY STUB NOW:
 * Establishing the service interface prevents Server Actions in later phases
 * from accidentally calling Drizzle directly. Any engineer building the
 * admin panel imports from this service — not from Drizzle.
 *
 * TRANSACTION STRATEGY:
 * createProduct() — transactional.
 *   Creates Product + initial Variant + Inventory record atomically.
 *   A product without a variant has no SKU. A variant without inventory
 *   has no stock record. All three must succeed or none should persist.
 *
 * updateProduct() — non-transactional (single-table update).
 *   Only updates the products row. Variant/inventory updates are
 *   handled by their own services.
 *
 * archiveProduct() — non-transactional.
 *   Sets status = 'ARCHIVED' and deletedAt. Does not delete records.
 *   Historical orders that reference the product remain intact.
 */

import "server-only"
import { DomainError, DomainErrorCode } from "../errors"

// ── Input Types ───────────────────────────────────────────────────────────────

export interface CreateProductInput {
  slug: string
  name: string
  description?: string
  categoryId: string
  brandId?: string
  seoTitle?: string
  seoDescription?: string
  /** Initial SKU for the first default variant. */
  initialSku: string
  /** Initial stock quantity for the first variant. */
  initialQuantity?: number
}

export interface UpdateProductInput {
  id: string
  name?: string
  description?: string
  categoryId?: string
  brandId?: string
  seoTitle?: string
  seoDescription?: string
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}

export interface ArchiveProductInput {
  id: string
}

// ── Service ───────────────────────────────────────────────────────────────────

const ProductService = {
  /**
   * Create a new product with its first default variant and inventory record.
   *
   * TRANSACTION BOUNDARY: This method must run inside a Drizzle transaction.
   * Failure at any step must roll back the entire operation.
   *
   * @throws {DomainError} PRODUCT_SLUG_CONFLICT — if slug is already taken
   * @throws {DomainError} PRODUCT_CATEGORY_NOT_FOUND — if category does not exist
   *
   * TODO (Phase 6 — Admin Dashboard): Implement with:
   *   await db.transaction(async (tx) => {
   *     const [product] = await tx.insert(products).values({ ... }).returning()
   *     const [variant] = await tx.insert(variants).values({ productId: product.id, sku }).returning()
   *     await tx.insert(inventory).values({ variantId: variant.id, quantity })
   *   })
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createProduct(_input: CreateProductInput): Promise<{ id: string }> {
    throw new DomainError(
      DomainErrorCode.UNKNOWN,
      "ProductService.createProduct is not yet implemented. Implement in Phase 6 when the Admin Dashboard is built."
    )
  },

  /**
   * Update mutable product fields.
   *
   * Immutable fields (slug, id, createdAt) cannot be changed through this method.
   * Slug changes require a redirect strategy and are handled separately.
   *
   * @throws {DomainError} PRODUCT_NOT_FOUND — if product does not exist
   *
   * TODO (Phase 6 — Admin Dashboard): Implement with:
   *   await db.update(products).set({ ...input, updatedAt: new Date() }).where(eq(products.id, input.id))
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateProduct(_input: UpdateProductInput): Promise<void> {
    throw new DomainError(
      DomainErrorCode.UNKNOWN,
      "ProductService.updateProduct is not yet implemented. Implement in Phase 6 when the Admin Dashboard is built."
    )
  },

  /**
   * Soft-archive a product. Sets status to ARCHIVED and records deletedAt.
   * Archived products are excluded from storefront queries automatically.
   * Does NOT hard-delete — preserves historical order references.
   *
   * @throws {DomainError} PRODUCT_NOT_FOUND — if product does not exist
   * @throws {DomainError} PRODUCT_ALREADY_ARCHIVED — if already archived
   *
   * TODO (Phase 6 — Admin Dashboard): Implement with:
   *   await db.update(products).set({ status: "ARCHIVED", deletedAt: new Date() }).where(eq(products.id, input.id))
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async archiveProduct(_input: ArchiveProductInput): Promise<void> {
    throw new DomainError(
      DomainErrorCode.UNKNOWN,
      "ProductService.archiveProduct is not yet implemented. Implement in Phase 6 when the Admin Dashboard is built."
    )
  },
}

export { ProductService }
