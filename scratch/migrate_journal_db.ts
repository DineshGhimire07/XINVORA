import postgres from "postgres"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const sql = postgres(process.env.DATABASE_URL!)

async function main() {
  console.log("Starting direct journal schema migration...")

  // 1. Categories columns updates
  await sql`ALTER TABLE journal_categories ADD COLUMN IF NOT EXISTS description text;`
  await sql`ALTER TABLE journal_categories ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now() NOT NULL;`
  await sql`ALTER TABLE journal_categories ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now() NOT NULL;`
  console.log("- Updated journal_categories table columns")

  // 2. Clear posts to safely convert body type or drop column if necessary
  const postsCount = await sql`SELECT count(*) FROM journal_posts`
  const countVal = parseInt(postsCount[0].count)
  console.log(`- Current journal_posts rows count: ${countVal}`)

  if (countVal > 0) {
    await sql`TRUNCATE TABLE journal_posts CASCADE`
    console.log("- Truncated journal_posts table for column type conversion")
  }

  // 3. Drop existing body column and recreate as jsonb to be perfectly clean
  await sql`ALTER TABLE journal_posts DROP COLUMN IF EXISTS body;`
  await sql`ALTER TABLE journal_posts ADD COLUMN body jsonb DEFAULT '[]'::jsonb NOT NULL;`
  console.log("- Converted body column to jsonb in journal_posts")

  // 4. Drop is_published and add workflow_state
  await sql`ALTER TABLE journal_posts DROP COLUMN IF EXISTS is_published;`

  // 5. Add new columns to journal_posts
  const postsColsToAdd = [
    { name: "gallery", type: "jsonb DEFAULT '[]'::jsonb" },
    { name: "workflow_state", type: "varchar(50) DEFAULT 'DRAFT' NOT NULL" },
    { name: "visibility", type: "varchar(50) DEFAULT 'PUBLIC' NOT NULL" },
    { name: "is_featured", type: "boolean DEFAULT false NOT NULL" },
    { name: "is_pinned", type: "boolean DEFAULT false NOT NULL" },
    { name: "allow_comments", type: "boolean DEFAULT true NOT NULL" },
    { name: "reading_time_override", type: "integer" },
    { name: "locale", type: "varchar(10) DEFAULT 'en' NOT NULL" },
    { name: "translation_group_id", type: "uuid" },
    { name: "seo_title", type: "varchar(255)" },
    { name: "meta_description", type: "text" },
    { name: "canonical_url", type: "varchar(1024)" },
    { name: "og_title", type: "varchar(255)" },
    { name: "og_description", type: "text" },
    { name: "og_image", type: "varchar(1024)" },
    { name: "twitter_title", type: "varchar(255)" },
    { name: "twitter_description", type: "text" },
    { name: "twitter_image", type: "varchar(1024)" },
    { name: "robots_index", type: "boolean DEFAULT true NOT NULL" },
    { name: "robots_follow", type: "boolean DEFAULT true NOT NULL" },
    { name: "focus_keyword", type: "varchar(255)" },
    { name: "structured_data", type: "jsonb" },
  ]

  for (const col of postsColsToAdd) {
    await sql.unsafe(`ALTER TABLE journal_posts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`)
  }
  console.log("- Added new columns to journal_posts")

  // 6. Create journal_tags
  await sql`
    CREATE TABLE IF NOT EXISTS journal_tags (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      name varchar(255) NOT NULL,
      slug varchar(255) NOT NULL UNIQUE,
      created_at timestamp without time zone DEFAULT now() NOT NULL
    );
  `
  console.log("- Created journal_tags table")

  // 7. Create journal_post_tags
  await sql`
    CREATE TABLE IF NOT EXISTS journal_post_tags (
      post_id uuid REFERENCES journal_posts(id) ON DELETE CASCADE,
      tag_id uuid REFERENCES journal_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );
  `
  console.log("- Created journal_post_tags table")

  // 8. Create journal_revisions
  await sql`
    CREATE TABLE IF NOT EXISTS journal_revisions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      post_id uuid REFERENCES journal_posts(id) ON DELETE CASCADE NOT NULL,
      revision_data jsonb NOT NULL,
      changed_by_id uuid REFERENCES users(id) NOT NULL,
      created_at timestamp without time zone DEFAULT now() NOT NULL
    );
  `
  console.log("- Created journal_revisions table")

  // 9. Create journal_views
  await sql`
    CREATE TABLE IF NOT EXISTS journal_views (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      post_id uuid REFERENCES journal_posts(id) ON DELETE CASCADE NOT NULL,
      anonymous_id varchar(100),
      ip_hash varchar(64),
      created_at timestamp without time zone DEFAULT now() NOT NULL
    );
  `
  console.log("- Created journal_views table")

  console.log("Migration executed successfully!")
  await sql.end()
}

main().catch(async (e) => {
  console.error("Migration failed:", e)
  await sql.end()
})
