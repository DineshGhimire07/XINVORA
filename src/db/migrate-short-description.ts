import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Running short_description migration...")
  try {
    await sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "short_description" TEXT;`
    console.log("✓ Column short_description added to products table.")
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      console.log("Column already exists — skipping.")
    } else {
      throw err
    }
  }
  await sql.end()
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
