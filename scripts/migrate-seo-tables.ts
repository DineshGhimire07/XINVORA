import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
dotenv.config()

import postgres from "postgres"

async function runSeoMigration() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error("DATABASE_URL is not set!")
    process.exit(1)
  }

  console.log("Connecting to PostgreSQL at:", dbUrl.replace(/:[^:@]+@/, ":***@"))
  const sql = postgres(dbUrl)

  try {
    console.log("Creating SEO tables...")

    await sql`
      CREATE TABLE IF NOT EXISTS seo_issues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        rule_id VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
        message TEXT NOT NULL,
        impact TEXT,
        fix_strategies JSONB NOT NULL DEFAULT '[]'::jsonb,
        status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS seo_page_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url VARCHAR(1024) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        title VARCHAR(500),
        meta_description TEXT,
        headings JSONB NOT NULL DEFAULT '[]'::jsonb,
        links JSONB NOT NULL DEFAULT '[]'::jsonb,
        images JSONB NOT NULL DEFAULT '[]'::jsonb,
        schema_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        html_hash VARCHAR(64),
        snapshot_version INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS seo_redirects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_url VARCHAR(1024) NOT NULL UNIQUE,
        target_url VARCHAR(1024) NOT NULL,
        status_code INTEGER NOT NULL DEFAULT 301,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS seo_redirect_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        redirect_id UUID NOT NULL REFERENCES seo_redirects(id) ON DELETE CASCADE,
        referer VARCHAR(1024),
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS seo_audit_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        overall_score INTEGER NOT NULL,
        indexed_pages INTEGER NOT NULL,
        issues_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
        improvements_log JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `

    console.log("✅ All SEO tables created successfully!")
  } catch (error) {
    console.error("❌ Migration error:", error)
  } finally {
    await sql.end()
  }
}

runSeoMigration()
