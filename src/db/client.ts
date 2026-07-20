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
    prepare: false,
    max_lifetime: 30, // Recycles connections before Supabase pooler drops them
    idle_timeout: 10,
    connect_timeout: 10,
  })

globalForDb.__dbClient = queryClient

// Initialize Drizzle ORM with the postgres client and schema
export const db = drizzle(queryClient, { schema })

export type Database = typeof db
