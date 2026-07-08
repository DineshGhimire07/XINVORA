require("dotenv").config({ path: ".env.local" })
const postgres = require("postgres")

const sql = postgres(process.env.DATABASE_URL)

async function migrate() {
  try {
    console.log("Creating settings tables...")
    
    // Create app_settings
    await sql`
      CREATE TABLE IF NOT EXISTS "app_settings" (
        "key" varchar(100) PRIMARY KEY NOT NULL,
        "value" jsonb NOT NULL,
        "version" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "updated_by" uuid REFERENCES "users"("id")
      );
    `
    console.log("Created app_settings table")

    // Create settings_history
    await sql`
      CREATE TABLE IF NOT EXISTS "settings_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "setting_key" varchar(100) NOT NULL REFERENCES "app_settings"("key") ON DELETE cascade,
        "old_value" jsonb,
        "new_value" jsonb NOT NULL,
        "changed_by" uuid REFERENCES "users"("id"),
        "changed_at" timestamp DEFAULT now() NOT NULL
      );
    `
    console.log("Created settings_history table")
    
    // Create indexes for settings_history
    await sql`
      CREATE INDEX IF NOT EXISTS "settings_history_key_idx" ON "settings_history" ("setting_key");
    `
    await sql`
      CREATE INDEX IF NOT EXISTS "settings_history_changed_at_idx" ON "settings_history" ("changed_at");
    `
    console.log("Created indexes")

    console.log("Migration successful!")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

migrate()
