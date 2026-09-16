// scripts/fix-publish-dates.ts
// Spread all articles across realistic past publish dates

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"
import { eq } from "drizzle-orm"
import { journalPosts } from "../src/db/schema"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

async function fixDates() {
  console.log("📅 Spreading publish dates across past months...\n")

  const schedule = [
    { slug: "style-black-bodycon-dress",                    date: new Date("2026-06-12T09:30:00Z") },
    { slug: "how-to-build-capsule-wardrobe-women-nepal",    date: new Date("2026-07-03T10:15:00Z") },
    { slug: "how-to-style-oversized-shirt",                 date: new Date("2026-07-19T08:45:00Z") },
    { slug: "office-outfit-ideas-women-kathmandu",          date: new Date("2026-08-04T11:00:00Z") },
    { slug: "quiet-luxury-aesthetic-nepal",                  date: new Date("2026-08-15T09:20:00Z") },
    { slug: "how-to-style-midi-dress",                      date: new Date("2026-08-27T10:30:00Z") },
    { slug: "what-to-wear-nepali-wedding-guest",            date: new Date("2026-09-02T08:00:00Z") },
    { slug: "best-dashain-outfits-nepal",                   date: new Date("2026-09-08T10:00:00Z") },
    { slug: "tihar-outfit-ideas-nepal",                     date: new Date("2026-09-13T09:45:00Z") },
  ]

  for (const { slug, date } of schedule) {
    const [post] = await db.select().from(journalPosts).where(eq(journalPosts.slug, slug)).limit(1)
    if (!post) {
      console.log(`  ⚠️  Not found: ${slug}`)
      continue
    }
    await db.update(journalPosts)
      .set({ publishedAt: date, updatedAt: date, createdAt: date })
      .where(eq(journalPosts.id, post.id))
    console.log(`  ✅  ${date.toDateString().slice(4)}  →  /journal/${slug}`)
  }

  console.log("\n🎉 All publish dates updated.")
  await sql.end()
}

fixDates().catch((err) => {
  console.error("❌ Failed:", err)
  process.exit(1)
})
