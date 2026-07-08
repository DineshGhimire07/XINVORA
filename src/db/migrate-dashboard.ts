import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Applying customer dashboard (Phase 5E) database changes manually...")
  try {
    // 1. Add is_default_shipping and is_default_billing to addresses table
    try {
      await sql`ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "is_default_shipping" boolean NOT NULL DEFAULT false;`
      await sql`ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "is_default_billing" boolean NOT NULL DEFAULT false;`
      console.log("Added default shipping/billing columns to addresses table.")
    } catch (err) {
      console.error("Failed to alter addresses table:", err)
    }

    // 2. Create profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "phone" varchar(50),
        "date_of_birth" date,
        "profile_image" varchar(500),
        "newsletter_preference" boolean NOT NULL DEFAULT false,
        "language_preference" varchar(10) NOT NULL DEFAULT 'en',
        "timezone" varchar(100) NOT NULL DEFAULT 'UTC',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `
    console.log("Created profiles table.")

    // 3. Create notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" varchar(255) NOT NULL,
        "message" text NOT NULL,
        "type" varchar(50) NOT NULL DEFAULT 'INFO',
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `
    console.log("Created notifications table.")

    // 4. Create indexes
    await sql`CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");`
    await sql`CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications" ("is_read");`
    console.log("Created notifications indexes.")

    console.log("Customer Dashboard database migration completed successfully!")
  } catch (err) {
    console.error("Migration failed:", err)
  }
  process.exit(0)
}

run()
