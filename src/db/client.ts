import "server-only"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables")
}

// ── Singleton Pattern (all environments) ────────────────────────────────────
// In development, Next.js HMR re-evaluates modules on every change; without
// caching this would create a new connection pool per reload and exhaust the
// database connection limit. In production/serverless, caching this on
// globalThis lets warm function instances reuse an existing connection
// instead of paying a fresh TCP+SSL handshake cost on every re-evaluation.

const globalForDb = globalThis as unknown as {
  __dbClient: ReturnType<typeof postgres> | undefined
}

const queryClient =
  globalForDb.__dbClient ??
  postgres(process.env.DATABASE_URL, {
    prepare: false,        // Required for Supabase pgBouncer transaction mode
    fetch_types: false,    // Skip pg_catalog type round-trip on connect (saves 1 RTT)

    // ── Connection limits ──────────────────────────────────────────────────
    // Allow up to 10 connections so Promise.all parallel queries (dashboard,
    // inventory, products) execute concurrently without waiting in queue.
    max: 10,

    // ── Connection lifetime ───────────────────────────────────────────────
    // Keep connections alive for warm reuse across consecutive navigations.
    max_lifetime: 120,

    // ── Idle timeout ──────────────────────────────────────────────────────
    // Allow connections to stay warm during active user sessions.
    idle_timeout: 20,

    // ── Connect timeout ───────────────────────────────────────────────────
    // Fail fast if pooler is unreachable rather than holding the request open.
    connect_timeout: 10,
  })

globalForDb.__dbClient = queryClient

// Initialize Drizzle ORM with the postgres client and schema
export const db = drizzle(queryClient, { schema })

export type Database = typeof db
