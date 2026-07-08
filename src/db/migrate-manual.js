const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" }); // check if .env or .env.local has the env vars

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: "require" });

async function run() {
  try {
    console.log("Running manual migration...");
    await sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "badge" varchar(50);`;
    await sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "details" text;`;
    await sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "care_guide" text;`;
    await sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "size_guide" text;`;
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

run();
