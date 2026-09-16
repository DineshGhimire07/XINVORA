import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import dotenv from "dotenv"
import { asc } from "drizzle-orm"
import { journalPosts } from "../src/db/schema"

dotenv.config({ path: ".env.local" })
const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
const db = drizzle(sql)

async function check() {
  const posts = await db
    .select({ slug: journalPosts.slug, state: journalPosts.workflowState, visibility: journalPosts.visibility, publishedAt: journalPosts.publishedAt })
    .from(journalPosts)
    .orderBy(asc(journalPosts.publishedAt))

  console.log(`\n📋 Total posts: ${posts.length}\n`)
  posts.forEach(p => {
    const date = p.publishedAt?.toISOString().slice(0, 10) ?? "NULL"
    console.log(`  ${date}  [${p.state}] [${p.visibility}]  /journal/${p.slug}`)
  })
  await sql.end()
}

check().catch(console.error)
