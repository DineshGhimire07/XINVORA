import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")

async function run() {
  const sql = postgres(connectionString!, { max: 1 })
  const db = drizzle(sql)
  console.log("Applying migrations...")
  const fs = require('fs')
  const path = require('path')
  const sqlContent = fs.readFileSync(path.join(process.cwd(), 'src/db/migrations/0005_big_dakota_north.sql'), 'utf-8')
  
  const statements = sqlContent.split('--> statement-breakpoint')
  for (const stmt of statements) {
    if (stmt.trim()) {
      await sql.unsafe(stmt.trim())
    }
  }
  console.log("Migrations applied successfully!")
  process.exit(0)
}
run()
