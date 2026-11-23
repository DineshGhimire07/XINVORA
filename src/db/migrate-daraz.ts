/**
 * migrate-daraz.ts
 * Creates all Daraz Listing Studio tables in Supabase Postgres.
 * Run with: npx tsx src/db/migrate-daraz.ts
 */

import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")

const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("🚀 Running XINVORA Daraz Listing Studio migration...")

  try {
    // 1. Create enums (safe if already exists)
    try {
      await sql`CREATE TYPE daraz_job_status AS ENUM (
        'PENDING', 'READING_FOLDER', 'VALIDATING', 'UPLOADING_IMAGES',
        'SUBMITTING_LISTING', 'CHECKING_QC', 'COMPLETED', 'FAILED', 'PAUSED'
      )`
      console.log("✓ Created daraz_job_status enum")
    } catch {
      console.log("  daraz_job_status enum already exists — skipping")
    }

    try {
      await sql`CREATE TYPE daraz_listing_status AS ENUM (
        'DRAFT', 'VALIDATED', 'IMAGES_UPLOADED', 'SUBMITTED',
        'PENDING_QC', 'QC_APPROVED', 'QC_REJECTED', 'FAILED'
      )`
      console.log("✓ Created daraz_listing_status enum")
    } catch {
      console.log("  daraz_listing_status enum already exists — skipping")
    }

    // 2. daraz_connections
    await sql`
      CREATE TABLE IF NOT EXISTS "daraz_connections" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "seller_id" varchar(100),
        "name" varchar(255),
        "account" varchar(255),
        "country" varchar(10) NOT NULL DEFAULT 'np',
        "encrypted_access_token" text NOT NULL,
        "encrypted_refresh_token" text NOT NULL,
        "access_token_expires_at" timestamp NOT NULL,
        "refresh_token_expires_at" timestamp NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS "daraz_conn_seller_idx" ON "daraz_connections" ("seller_id")`
    console.log("✓ daraz_connections table ready")

    // 3. daraz_category_templates
    await sql`
      CREATE TABLE IF NOT EXISTS "daraz_category_templates" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "daraz_category_id" varchar(100) NOT NULL UNIQUE,
        "category_name" varchar(255) NOT NULL,
        "category_path" text,
        "is_leaf" boolean NOT NULL DEFAULT true,
        "attributes_schema" jsonb NOT NULL,
        "field_mappings" jsonb,
        "version" integer NOT NULL DEFAULT 1,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS "daraz_cat_tmpl_id_idx" ON "daraz_category_templates" ("daraz_category_id")`
    console.log("✓ daraz_category_templates table ready")

    // 4. daraz_product_submissions
    await sql`
      CREATE TABLE IF NOT EXISTS "daraz_product_submissions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "local_product_id" varchar(100) NOT NULL,
        "seller_sku" varchar(255) NOT NULL UNIQUE,
        "daraz_item_id" varchar(100),
        "title" varchar(500) NOT NULL,
        "daraz_category_id" varchar(100) NOT NULL,
        "status" daraz_listing_status NOT NULL DEFAULT 'DRAFT',
        "qc_status" varchar(100),
        "qc_reason" text,
        "submitted_payload" text,
        "daraz_response" jsonb,
        "error_log" text,
        "retry_count" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS "daraz_sub_sku_idx" ON "daraz_product_submissions" ("seller_sku")`
    await sql`CREATE INDEX IF NOT EXISTS "daraz_sub_local_id_idx" ON "daraz_product_submissions" ("local_product_id")`
    await sql`CREATE INDEX IF NOT EXISTS "daraz_sub_status_idx" ON "daraz_product_submissions" ("status")`
    console.log("✓ daraz_product_submissions table ready")

    // 5. daraz_image_cache
    await sql`
      CREATE TABLE IF NOT EXISTS "daraz_image_cache" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "file_hash" varchar(64) NOT NULL UNIQUE,
        "original_filename" varchar(255) NOT NULL,
        "daraz_url" text NOT NULL,
        "file_size" integer,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS "daraz_img_hash_idx" ON "daraz_image_cache" ("file_hash")`
    console.log("✓ daraz_image_cache table ready")

    // 6. daraz_queue_jobs
    await sql`
      CREATE TABLE IF NOT EXISTS "daraz_queue_jobs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "batch_id" varchar(100) NOT NULL,
        "local_product_id" varchar(100) NOT NULL,
        "folder_path" text NOT NULL,
        "status" daraz_job_status NOT NULL DEFAULT 'PENDING',
        "current_step" varchar(100),
        "progress_percent" integer NOT NULL DEFAULT 0,
        "error_message" text,
        "metadata" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS "daraz_queue_batch_idx" ON "daraz_queue_jobs" ("batch_id")`
    await sql`CREATE INDEX IF NOT EXISTS "daraz_queue_status_idx" ON "daraz_queue_jobs" ("status")`
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "daraz_queue_batch_product_idx" ON "daraz_queue_jobs" ("batch_id", "local_product_id")`
    console.log("✓ daraz_queue_jobs table ready")

    // 7. daraz_audit_logs
    await sql`
      CREATE TABLE IF NOT EXISTS "daraz_audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "action" varchar(100) NOT NULL,
        "status" varchar(20) NOT NULL,
        "status_code" integer,
        "request_params" jsonb,
        "response_body" jsonb,
        "error_message" text,
        "duration_ms" integer,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS "daraz_audit_action_idx" ON "daraz_audit_logs" ("action")`
    await sql`CREATE INDEX IF NOT EXISTS "daraz_audit_created_idx" ON "daraz_audit_logs" ("created_at")`
    console.log("✓ daraz_audit_logs table ready")

    console.log("\n🎉 All Daraz tables created successfully!")
  } catch (err) {
    console.error("❌ Migration failed:", err)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

run()
