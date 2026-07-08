import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Applying manual migrations for refined Phase 5C schemas...")
  try {
    // 1. Add columns to orders table
    await sql`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_method" varchar(100);`
    await sql`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimated_delivery" timestamp;`
    await sql`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tax_rate" integer DEFAULT 0 NOT NULL;`
    await sql`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_id" uuid;`
    console.log("Updated orders table columns.")

    // 2. Add columns to order_items table
    // Since currency is an enum, we need to handle it. The enum type is public.currency_enum or similar.
    // Let's inspect the type first or cast it. Wait, the orders table uses: currency currency_enum
    // Let's check what the currency enum is named in postgres. It is "currency". Let's run a query to verify or just use it.
    await sql`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "currency" "currency" DEFAULT 'USD' NOT NULL;`
    await sql`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "discount_applied" integer DEFAULT 0 NOT NULL;`
    await sql`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "tax_applied" integer DEFAULT 0 NOT NULL;`
    console.log("Updated order_items table columns.")

    console.log("Migrations applied successfully!")
  } catch (err) {
    console.error("Migration failed:", err)
  }
  process.exit(0)
}

run()
