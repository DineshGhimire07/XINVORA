import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"
import { eq } from "drizzle-orm"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

async function checkData() {
  const usersRes = await sql`SELECT id, email, first_name, last_name, role FROM users LIMIT 10`
  console.log("Users:", usersRes)

  const catsRes = await sql`SELECT id, name, slug FROM journal_categories`
  console.log("Journal Categories:", catsRes)

  const prodsRes = await sql`SELECT id, name, slug FROM products WHERE status = 'PUBLISHED' LIMIT 10`
  console.log("Sample Products:", prodsRes)

  await sql.end()
}

checkData().catch(console.error)
