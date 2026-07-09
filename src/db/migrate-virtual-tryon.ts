import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Running virtual_tryon_prompt migration...")
  try {
    await sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "virtual_tryon_prompt" TEXT;`
    console.log("✓ Column virtual_tryon_prompt added to products table.")
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
