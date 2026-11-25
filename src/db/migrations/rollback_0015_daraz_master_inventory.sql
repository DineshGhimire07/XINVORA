-- Rollback Script for Migration 0015
-- Reverses all schema changes made in 0015 safely.

DROP TABLE IF EXISTS "daraz_stock_reservations" CASCADE;
DROP TABLE IF EXISTS "daraz_sync_logs" CASCADE;
DROP TABLE IF EXISTS "daraz_synced_products" CASCADE;

DROP INDEX IF EXISTS "products_daraz_master_idx";
DROP INDEX IF EXISTS "products_legacy_archived_idx";

ALTER TABLE "products" DROP COLUMN IF EXISTS "is_daraz_master";
ALTER TABLE "products" DROP COLUMN IF EXISTS "is_legacy_archived";
