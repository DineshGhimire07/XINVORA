import postgres from "postgres"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const sql = postgres(process.env.DATABASE_URL!)

async function main() {
  const categoriesCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'journal_categories'
  `
  console.log("journal_categories columns:")
  console.log(categoriesCols)

  const postsCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'journal_posts'
  `
  console.log("journal_posts columns:")
  console.log(postsCols)

  await sql.end()
}

main().catch(console.error)
