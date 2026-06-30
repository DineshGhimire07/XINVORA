/**
 * db/client.ts — XINVORA Database Client
 *
 * Adapter-agnostic database client stub.
 * Replace this file when introducing an ORM (Drizzle, Prisma, Kysely).
 *
 * The interface exported here is what the rest of the app uses.
 * Swapping ORM = change only this file and the schema/ directory.
 * All consumers import from @/db (barrel at index.ts).
 *
 * When ready:
 * 1. Install your ORM: npm install drizzle-orm @vercel/postgres
 * 2. Replace the stub below with the real client initialization
 * 3. Define schemas in db/schema/
 * 4. Run migrations from db/migrations/
 */

/**
 * Placeholder — replace with actual ORM client when backend is ready.
 *
 * Drizzle example:
 *   import { drizzle } from "drizzle-orm/vercel-postgres"
 *   import { sql } from "@vercel/postgres"
 *   export const db = drizzle(sql)
 *
 * Prisma example:
 *   import { PrismaClient } from "@prisma/client"
 *   const globalForPrisma = global as unknown as { prisma: PrismaClient }
 *   export const db = globalForPrisma.prisma || new PrismaClient()
 *   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
 */

// Stub export — will be replaced when backend is introduced
export const db = null as unknown as never

export type Database = typeof db
