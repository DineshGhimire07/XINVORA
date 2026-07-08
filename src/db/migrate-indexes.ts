import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Applying orders table indexing manual migration...")
  try {
    await sql`CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders" ("user_id");`
    await sql`CREATE INDEX IF NOT EXISTS "orders_coupon_id_idx" ON "orders" ("coupon_id");`
    await sql`CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");`
    await sql`CREATE INDEX IF NOT EXISTS "orders_payment_status_idx" ON "orders" ("payment_status");`
    await sql`CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" ("created_at");`
    console.log("Indexes created successfully!")
  } catch (err) {
    console.error("Migration failed:", err)
  }
  process.exit(0)
}

run()
