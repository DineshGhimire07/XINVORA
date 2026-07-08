/**
 * services/collection/collection.service.ts — XINVORA Collection Write Service
 *
 * Owns ALL business rules for creating and updating editorial collections.
 *
 * STATUS: Architecture stub.
 * Implementations deferred to Phase 6 (Admin Dashboard).
 *
 * TRANSACTION STRATEGY:
 * createCollection() — non-transactional (single-table insert).
 * updateCollection() — non-transactional (single-table update).
 * assignProducts() — transactional if batch-assigning many products atomically.
 *
 * BUSINESS RULES TO ENFORCE AT IMPLEMENTATION TIME:
 * - Slug must be unique across all collections.
 * - publishedAt is set by the service, not the caller — callers set isActive=true.
 * - Product assignment to a collection must verify the product is PUBLISHED.
 */

import "server-only"
import { DomainError, DomainErrorCode } from "../errors"

export interface CreateCollectionInput {
  slug: string
  name: string
  description?: string
  imageUrl?: string
}

export interface UpdateCollectionInput {
  id: string
  name?: string
  description?: string
  imageUrl?: string
  /** Setting isActive=true automatically sets publishedAt if not already set. */
  isActive?: boolean
}

const CollectionService = {
  /**
   * Create a new editorial collection (inactive by default).
   *
   * @throws {DomainError} COLLECTION_SLUG_CONFLICT — if slug already exists
   *
   * TODO (Phase 6): Implement.
   */
  async createCollection(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: CreateCollectionInput
  ): Promise<{ id: string }> {
    throw new DomainError(
      DomainErrorCode.UNKNOWN,
      "CollectionService.createCollection is not yet implemented. Implement in Phase 6."
    )
  },

  /**
   * Update collection metadata or publish/unpublish it.
   * Publishing sets publishedAt to now if previously unset.
   *
   * @throws {DomainError} COLLECTION_NOT_FOUND — if collection does not exist
   *
   * TODO (Phase 6): Implement.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateCollection(_input: UpdateCollectionInput): Promise<void> {
    throw new DomainError(
      DomainErrorCode.UNKNOWN,
      "CollectionService.updateCollection is not yet implemented. Implement in Phase 6."
    )
  },
}

export { CollectionService }
