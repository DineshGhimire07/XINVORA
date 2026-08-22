import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Widening payment_proof_url column to TEXT...")
  try {
    // ALTER varchar(1000) → text so base64 data URLs (can be hundreds of KB)
    // no longer cause INSERT failures on the orders table.
    await sql`
      ALTER TABLE "orders"
      ALTER COLUMN "payment_proof_url" TYPE text;
    `
    console.log("✓ payment_proof_url column changed to TEXT successfully.")
  } catch (err: any) {
    console.error("Migration failed:", err)
  }
  process.exit(0)
}

run()
