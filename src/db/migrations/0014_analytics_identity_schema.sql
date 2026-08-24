-- Migration: 0014_analytics_identity_schema.sql
--
-- Purpose:
--   1. Add anonymous_id to user_sessions for persistent visitor identity.
--      Enables COUNT(DISTINCT anonymous_id) queries and cross-session
--      anonymous visitor tracking without an identity-link table.
--
--   2. Add collection_id and variant_id to user_events as first-class
--      dimension columns for collection analytics and variant-level
--      behavioral analytics.
--
--   3. Add analytics performance indexes for bounded aggregate queries.
--
-- Safety:
--   All statements are fully idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
--   Safe to run multiple times. No data is modified or deleted.
--   Nullable columns: no backfill required. NULL = pre-migration row (unknown).
--
-- Delivery:
--   This migration is NOT Drizzle-kit managed (journal last entry = 0011).
--   Run directly via Supabase SQL editor or psql.
--   For index builds on large tables in production, consider using
--   CREATE INDEX CONCURRENTLY (must be run outside a transaction block).
--
-- Run AFTER deploying the application code changes.
-- The new columns are nullable — old code paths that don't send these
-- fields will simply write NULL, which is correct and safe.

-- ── 1. user_sessions: add anonymous_id ──────────────────────────────────────
-- Persistent browser-level visitor identity (from xinvora_anon_id cookie).
-- ONE anonymous_id → MANY session_key rows.
-- VARCHAR(64): matches "anon_" prefix (5 chars) + 32-char UUID without hyphens.
ALTER TABLE "user_sessions"
  ADD COLUMN IF NOT EXISTS "anonymous_id" VARCHAR(64);

-- ── 2. user_events: add collection_id ───────────────────────────────────────
-- No FK: collections can be deleted without losing event history.
-- Populated by COLLECTION_VIEW, CART_ADD (with collection context), etc.
ALTER TABLE "user_events"
  ADD COLUMN IF NOT EXISTS "collection_id" UUID;

-- ── 3. user_events: add variant_id ──────────────────────────────────────────
-- No FK: variants are soft-deleted (deleted_at), not hard-deleted.
-- Populated by CART_ADD, CART_REMOVE, SIZE_SELECTED, COLOR_SELECTED.
ALTER TABLE "user_events"
  ADD COLUMN IF NOT EXISTS "variant_id" UUID;

-- ── 4. search_queries: table creation (Phase 4 — Search Analytics) ───────────
-- Single source of truth for search intelligence.
-- Populated by Pipeline 1 on SEARCH events.
CREATE TABLE IF NOT EXISTS "search_queries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" VARCHAR(64) NOT NULL,
  "anonymous_id" VARCHAR(64) NOT NULL,
  "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "query" VARCHAR(255) NOT NULL,
  "results_count" INTEGER NOT NULL DEFAULT 0,
  "clicked_product_id" UUID REFERENCES "products"("id") ON DELETE SET NULL,
  "converted" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────

-- user_sessions: anonymous_id + started_at composite
-- Query: COUNT(DISTINCT anonymous_id) WHERE started_at BETWEEN :start AND :end
-- Query: SELECT * FROM user_sessions WHERE anonymous_id = :id ORDER BY started_at DESC
CREATE INDEX IF NOT EXISTS "session_anon_started_idx"
  ON "user_sessions" ("anonymous_id", "started_at");

-- user_sessions: utm_source + started_at composite
-- Query: Traffic tab — GROUP BY utm_source WHERE started_at BETWEEN :start AND :end
CREATE INDEX IF NOT EXISTS "session_utm_source_started_idx"
  ON "user_sessions" ("utm_source", "started_at");

-- user_sessions: country_code + started_at composite
-- Query: Geo breakdown — GROUP BY country_code WHERE started_at BETWEEN :start AND :end
CREATE INDEX IF NOT EXISTS "session_country_started_idx"
  ON "user_sessions" ("country_code", "started_at");

-- user_events: event_type + created_at composite
-- Query: Funnel — WHERE event_type IN (...) AND created_at BETWEEN :start AND :end
-- Query: COUNT(*) WHERE event_type = 'CART_ADD' AND created_at BETWEEN :start AND :end
-- Replaces relying on event_created_idx for type-filtered aggregations.
CREATE INDEX IF NOT EXISTS "event_type_created_idx"
  ON "user_events" ("event_type", "created_at");

-- user_events: collection_id
-- Query: GROUP BY collection_id for collection views, CTR, funnel per collection.
CREATE INDEX IF NOT EXISTS "event_collection_idx"
  ON "user_events" ("collection_id");

-- user_events: variant_id
-- Query: Variant-level behavioral analytics (cart abandonment by variant).
CREATE INDEX IF NOT EXISTS "event_variant_idx"
  ON "user_events" ("variant_id");

-- search_queries: query index for aggregation
CREATE INDEX IF NOT EXISTS "search_queries_query_idx"
  ON "search_queries" ("query");

-- search_queries: created_at index for date-bounded queries
CREATE INDEX IF NOT EXISTS "search_queries_created_at_idx"
  ON "search_queries" ("created_at");
