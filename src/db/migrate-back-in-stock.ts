import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Applying back_in_stock_requests schema columns...")
  try {
    try {
      await sql`ALTER TABLE "back_in_stock_requests" ALTER COLUMN "email" SET DEFAULT '';`
      console.log("Set email default to empty string.")
    } catch (err: any) {
      console.log("email default already set or skipped:", err.message)
    }

    try {
      await sql`ALTER TABLE "back_in_stock_requests" ADD COLUMN "name" varchar(255) NOT NULL DEFAULT '';`
      console.log("Added 'name' column.")
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        console.log("Column 'name' already exists.")
      } else { throw err }
    }

    try {
      await sql`ALTER TABLE "back_in_stock_requests" ADD COLUMN "phone" varchar(50) NOT NULL DEFAULT '';`
      console.log("Added 'phone' column.")
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        console.log("Column 'phone' already exists.")
      } else { throw err }
    }

    try {
      await sql`ALTER TABLE "back_in_stock_requests" ADD COLUMN "product_name" varchar(255) NOT NULL DEFAULT '';`
      console.log("Added 'product_name' column.")
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        console.log("Column 'product_name' already exists.")
      } else { throw err }
    }

    console.log("✅ back_in_stock_requests migration complete.")
  } catch (err) {
    console.error("Migration failed:", err)
  }
  process.exit(0)
}

run()
