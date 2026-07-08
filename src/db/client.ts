import "server-only"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables")
}

// ── Singleton Pattern for Development ─────────────────────────────────────────
// During development, Next.js HMR re-evaluates modules on every change.
// Without a singleton, each reload creates a new connection pool, eventually
// exhausting the database connection limit.

const globalForDb = globalThis as unknown as {
  __dbClient: ReturnType<typeof postgres> | undefined
}

const queryClient = globalForDb.__dbClient ?? postgres(process.env.DATABASE_URL, { prepare: false })

if (process.env.NODE_ENV !== "production") {
  globalForDb.__dbClient = queryClient
}

// Initialize Drizzle ORM with the postgres client and schema
export const db = drizzle(queryClient, { schema })

export type Database = typeof db
