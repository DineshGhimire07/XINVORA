import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Applying payments schema manually...")
  try {
    // 1. Alter payment_status enum
    // PostgreSQL ADD VALUE cannot run inside a transaction in some drivers, so we run them sequentially
    const statusValues = ["NEW", "INITIATED", "AUTHORIZED", "CANCELLED", "PARTIALLY_REFUNDED", "EXPIRED"]
    for (const val of statusValues) {
      try {
        await sql.unsafe(`ALTER TYPE "payment_status" ADD VALUE '${val}';`)
        console.log(`Added ${val} to payment_status enum.`)
      } catch (err: any) {
        // Ignore if value already exists
        if (err.message?.includes("already exists")) {
          console.log(`Value ${val} already exists in payment_status enum.`)
        } else {
          throw err;
        }
      }
    }

    // 2. Create payment_provider type
    try {
      await sql`CREATE TYPE "payment_provider" AS ENUM ('NONE', 'KHALTI', 'ESEWA', 'STRIPE', 'PAYPAL', 'DUMMY', 'MANUAL', 'UNKNOWN');`
      console.log("Created payment_provider enum type.")
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        console.log("payment_provider enum type already exists.")
      } else {
        throw err
      }
    }

    // 3. Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "provider" "payment_provider" NOT NULL,
        "provider_payment_id" varchar(255),
        "status" "payment_status" NOT NULL,
        "amount" integer NOT NULL,
        "currency" "currency" NOT NULL,
        "failure_reason" varchar(1000),
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "session_expires_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "completed_at" timestamp
      );
    `
    console.log("Created payments table.")

    // 4. Create index on order_id and status
    await sql`CREATE INDEX IF NOT EXISTS "payments_order_id_idx" ON "payments" ("order_id");`
    await sql`CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" ("status");`
    await sql`CREATE INDEX IF NOT EXISTS "payments_provider_payment_id_idx" ON "payments" ("provider_payment_id");`
    console.log("Created payments table indexes.")

    console.log("Payments migrations applied successfully!")
  } catch (err) {
    console.error("Migration failed:", err)
  }
  process.exit(0)
}

run()
