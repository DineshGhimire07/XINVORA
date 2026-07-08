import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(sql);
  
  try {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Migrations applied successfully.");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
