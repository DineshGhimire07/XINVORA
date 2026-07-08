import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Applying sprint 1 schema manually...")
  try {
    // 1. Alter media_library
    try {
      await sql`ALTER TABLE "media_library" ADD COLUMN "provider" varchar(50) NOT NULL DEFAULT 'cloudinary';`
      await sql`ALTER TABLE "media_library" ADD COLUMN "provider_id" varchar(255);`
      console.log("Added provider and provider_id to media_library.")
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        console.log("Columns already exist in media_library.")
      } else {
        throw err
      }
    }

    // 2. Alter collections
    try {
      await sql`ALTER TABLE "collections" ADD COLUMN "parent_id" uuid;`
      await sql`ALTER TABLE "collections" ADD COLUMN "sort_order" integer NOT NULL DEFAULT 0;`
      await sql`ALTER TABLE "collections" ADD COLUMN "seo_title" varchar(255);`
      await sql`ALTER TABLE "collections" ADD COLUMN "seo_description" text;`
      console.log("Added parent_id, sort_order, seo_title, seo_description to collections.")
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        console.log("Columns already exist in collections.")
      } else {
        throw err
      }
    }

    // 3. Add Foreign Key for parent_id in collections
    try {
      await sql`
        ALTER TABLE "collections" 
        ADD CONSTRAINT "collections_parent_id_fkey" 
        FOREIGN KEY ("parent_id") 
        REFERENCES "collections"("id") 
        ON DELETE SET NULL;
      `
      console.log("Added parent_id foreign key constraint to collections.")
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        console.log("Foreign key constraint already exists in collections.")
      } else {
        throw err
      }
    }

    console.log("Sprint 1 migrations applied successfully!")
  } catch (err) {
    console.error("Migration failed:", err)
  }
  process.exit(0)
}

run()
