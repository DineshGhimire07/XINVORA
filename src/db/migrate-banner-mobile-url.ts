import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Running banner_mobile_url migration on collections table...")
  try {
    await sql`ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "banner_mobile_url" varchar(1024);`
    console.log("✓ Column banner_mobile_url added to collections table successfully.")
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

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
