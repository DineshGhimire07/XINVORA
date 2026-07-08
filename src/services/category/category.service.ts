/**
 * services/category/category.service.ts — XINVORA Category Write Service
 *
 * Owns ALL business rules for creating and updating categories.
 *
 * STATUS: Architecture stub.
 * Implementations deferred to Phase 6 (Admin Dashboard).
 *
 * TRANSACTION STRATEGY:
 * createCategory() — non-transactional (single-table insert).
 * updateCategory() — non-transactional (single-table update).
 *
 * BUSINESS RULES TO ENFORCE AT IMPLEMENTATION TIME:
 * - Slug must be unique across all categories.
 * - parentId, if provided, must reference an existing, active category.
 * - A category may not be its own parent (circular reference guard).
 * - Deactivating a category should propagate to its children (future rule).
 */

import "server-only"
import { DomainError, DomainErrorCode } from "../errors"

export interface CreateCategoryInput {
  slug: string
  name: string
  description?: string
  imageUrl?: string
  parentId?: string
}

export interface UpdateCategoryInput {
  id: string
  name?: string
  description?: string
  imageUrl?: string
  parentId?: string | null
  isActive?: boolean
}

const CategoryService = {
  /**
   * Create a new category node.
   *
   * @throws {DomainError} CATEGORY_SLUG_CONFLICT — if slug already exists
   * @throws {DomainError} CATEGORY_NOT_FOUND — if parentId references unknown category
   * @throws {DomainError} CATEGORY_CIRCULAR_REFERENCE — if parentId creates a cycle
   *
   * TODO (Phase 6): Implement.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createCategory(_input: CreateCategoryInput): Promise<{ id: string }> {
    throw new DomainError(
      DomainErrorCode.UNKNOWN,
      "CategoryService.createCategory is not yet implemented. Implement in Phase 6."
    )
  },

  /**
   * Update a category's metadata.
   *
   * @throws {DomainError} CATEGORY_NOT_FOUND — if category does not exist
   * @throws {DomainError} CATEGORY_CIRCULAR_REFERENCE — if new parentId creates a cycle
   *
   * TODO (Phase 6): Implement.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateCategory(_input: UpdateCategoryInput): Promise<void> {
    throw new DomainError(
      DomainErrorCode.UNKNOWN,
      "CategoryService.updateCategory is not yet implemented. Implement in Phase 6."
    )
  },
}

export { CategoryService }
