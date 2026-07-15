/**
 * db/queries/index.ts — XINVORA Repository Barrel
 *
 * Exposes all read models (queries) and types for the repository layer.
 * All services and UI components should import from this barrel file
 * rather than individual files, to ensure a clean boundary.
 */

export * from "./types"
export * from "./products"
export * from "./categories"
export * from "./collections"
export * from "./brands"
export * from "./inventory"
export * from "./search"
export * from "./catalog"
export * from "./cms"
