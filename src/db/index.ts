/**
 * db/index.ts — XINVORA Database Barrel
 *
 * Single import point for the entire database layer.
 *
 * Usage:
 *   import { db } from "@/db"
 *
 * This barrel lets us change the internal structure of the database
 * layer (client, schema imports, helpers) without updating any of
 * the consuming files across the codebase.
 */

export { db } from "./client"
export type { Database } from "./client"
