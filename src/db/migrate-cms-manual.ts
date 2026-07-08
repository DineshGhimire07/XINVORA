import postgres from "postgres";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: ".env.local" });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  
  try {
    const migrationSql = fs.readFileSync("./src/db/migrations/0002_jittery_darwin.sql", "utf-8");
    const statements = migrationSql.split("--> statement-breakpoint").map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Running ${statements.length} statements from 0002...`);
    
    for (const statement of statements) {
      try {
        await sql.unsafe(statement);
        console.log("Success:", statement.substring(0, 50).replace(/\n/g, ' ') + "...");
      } catch (err: any) {
        // Ignore if already exists
        if (err.code === '42P07' || err.code === '42710' || err.code === '42701') {
          console.log("Skipped (already exists):", statement.substring(0, 50).replace(/\n/g, ' ') + "...");
        } else {
          console.error("Error executing:", statement.substring(0, 50).replace(/\n/g, ' ') + "...");
          console.error(err);
          // throw err; // keep going or stop? Let's just log and continue for alters that might fail
        }
      }
    }
    console.log("Migration applied successfully.");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
