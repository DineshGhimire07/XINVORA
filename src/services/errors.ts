/**
 * services/errors.ts — XINVORA Domain Error System
 *
 * Provides a typed, structured error class for the Service Layer.
 *
 * WHY THIS EXISTS:
 * Server Actions must return `ActionResult<T>` with structured error codes —
 * never raw database exceptions. Services throw `DomainError` when a business
 * rule is violated. Server Actions catch it and translate it to `ActionResult`.
 *
 * USAGE:
 *   // Inside a Service:
 *   throw new DomainError("PRODUCT_SLUG_CONFLICT", "A product with this slug already exists")
 *
 *   // Inside a Server Action:
 *   catch (err) {
 *     return domainErrorToActionResult(err)
 *   }
 */

import "server-only"

// ── Error Code Registry ───────────────────────────────────────────────────────
// Add codes here as new domain concepts are introduced.
// Prefix by domain: PRODUCT_, CATEGORY_, COLLECTION_, INVENTORY_, etc.

export const DomainErrorCode = {
  // Generic
  UNKNOWN: "UNKNOWN",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Product
  PRODUCT_SLUG_CONFLICT: "PRODUCT_SLUG_CONFLICT",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  PRODUCT_ALREADY_ARCHIVED: "PRODUCT_ALREADY_ARCHIVED",
  PRODUCT_CATEGORY_NOT_FOUND: "PRODUCT_CATEGORY_NOT_FOUND",

  // Category
  CATEGORY_SLUG_CONFLICT: "CATEGORY_SLUG_CONFLICT",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  CATEGORY_CIRCULAR_REFERENCE: "CATEGORY_CIRCULAR_REFERENCE",

  // Collection
  COLLECTION_SLUG_CONFLICT: "COLLECTION_SLUG_CONFLICT",
  COLLECTION_NOT_FOUND: "COLLECTION_NOT_FOUND",

  // Inventory
  INVENTORY_NOT_FOUND: "INVENTORY_NOT_FOUND",
  INVENTORY_INSUFFICIENT_STOCK: "INVENTORY_INSUFFICIENT_STOCK",
  INVENTORY_NEGATIVE_QUANTITY: "INVENTORY_NEGATIVE_QUANTITY",
  INVENTORY_RELEASE_EXCEEDS_RESERVED: "INVENTORY_RELEASE_EXCEEDS_RESERVED",

  // Newsletter
  NEWSLETTER_ALREADY_SUBSCRIBED: "NEWSLETTER_ALREADY_SUBSCRIBED",
  NEWSLETTER_INVALID_EMAIL: "NEWSLETTER_INVALID_EMAIL",
} as const

export type DomainErrorCode = (typeof DomainErrorCode)[keyof typeof DomainErrorCode]

/**
 * Typed domain error. Always thrown by a Service.
 * Never thrown by a Repository (which should only throw DB-level errors).
 * Always caught by a Server Action and mapped to `ActionResult`.
 */
export class DomainError extends Error {
  readonly code: DomainErrorCode
  readonly fieldErrors?: Record<string, string[]>

  constructor(
    code: DomainErrorCode,
    message: string,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "DomainError"
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

/**
 * Type guard to narrow an unknown caught value to `DomainError`.
 */
export function isDomainError(err: unknown): err is DomainError {
  return err instanceof DomainError
}
