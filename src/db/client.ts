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
    // Supabase pooler (pgBouncer) has a hard connection cap shared across ALL
    // Vercel instances. max:10 per instance × many concurrent instances = pool
    // exhaustion → CONNECT_TIMEOUT. Keep this low (2-3 per instance).
    max: 3,

    // ── Connection lifetime ───────────────────────────────────────────────
    // Supabase aggressively recycles pooler connections. 30-min lifetime causes
    // "Broken pipe" when Supabase kills the connection server-side before we do.
    // 60s lifetime means we recycle proactively before Supabase can kill us.
    max_lifetime: 60,

    // ── Idle timeout ──────────────────────────────────────────────────────
    // Release idle connections quickly in serverless — each warm instance
    // holding idle connections contributes to pool exhaustion.
    idle_timeout: 5,

    // ── Connect timeout ───────────────────────────────────────────────────
    // Fail fast if pooler is unreachable rather than holding the request open.
    // 10s is generous enough for Asia-Pacific latency while not stalling SSR.
    connect_timeout: 10,
  })

globalForDb.__dbClient = queryClient

// Initialize Drizzle ORM with the postgres client and schema
export const db = drizzle(queryClient, { schema })

export type Database = typeof db
