-- Migration: 0012_add_missing_columns.sql
-- Adds two columns that were previously applied via ad-hoc migration scripts
-- (src/db/migrate-instagram.ts and src/app/api/admin/debug-media-match/route.ts).
-- These are now tracked as a proper versioned Drizzle migration.
--
-- Both statements are fully idempotent (IF NOT EXISTS) — safe to run on a
-- database where the columns already exist (no-op) or where they are absent.

-- products.instagram_reel_url
-- Declared in: src/db/schema/products.ts (instagramReelUrl)
-- Previously applied by: src/db/migrate-instagram.ts
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "instagram_reel_url" VARCHAR(500);

-- collections.image_mobile_url
-- Declared in: src/db/schema/collections.ts (imageMobileUrl)
-- Previously applied by: the now-removed DDL in /api/admin/debug-media-match
ALTER TABLE "collections"
  ADD COLUMN IF NOT EXISTS "image_mobile_url" VARCHAR(1024);
