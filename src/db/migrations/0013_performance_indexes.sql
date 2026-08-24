-- Migration: 0013_performance_indexes.sql
-- Adds indexes on high-cardinality foreign key columns that are frequently
-- used in JOIN and WHERE clauses but were identified as missing by the
-- Supabase Performance Advisor.
--
-- All statements are fully idempotent (IF NOT EXISTS).
-- These are read-path optimizations only — no schema changes.
--
-- RATIONALE per index:
--
-- addresses(user_id)        — Used in every account address lookup. Affects
--                             checkout address fetching for all users.
-- addresses(district_id)    — JOINed during Nepal geo validation queries.
-- addresses(municipality_id)— JOINed during Nepal geo validation queries.
--
-- cart_items(variant_id)    — JOINed to fetch full cart with variant details.
--                             Every cart open fires this query.
--
-- order_items(variant_id)   — JOINed in order detail pages and admin order view.
--
-- reviews(product_id)       — JOINed on PDP to fetch product reviews.
-- reviews(user_id)          — Used in account review history queries.
--
-- collections(parent_id)    — Used in hierarchical collection tree building
--                             (findHierarchicalCollections query).
--
-- product_pairings(paired_product_id)
--                           — JOINed when resolving complementary product
--                             recommendations on PDPs.
--
-- wishlist_items(variant_id)— JOINed when rendering wishlist with variant info.

-- addresses
CREATE INDEX IF NOT EXISTS "addresses_user_id_idx"
  ON "addresses" ("user_id");

CREATE INDEX IF NOT EXISTS "addresses_district_id_idx"
  ON "addresses" ("district_id");

CREATE INDEX IF NOT EXISTS "addresses_municipality_id_idx"
  ON "addresses" ("municipality_id");

-- cart_items
CREATE INDEX IF NOT EXISTS "cart_items_variant_id_idx"
  ON "cart_items" ("variant_id");

-- order_items
CREATE INDEX IF NOT EXISTS "order_items_variant_id_idx"
  ON "order_items" ("variant_id");

-- reviews
CREATE INDEX IF NOT EXISTS "reviews_product_id_idx"
  ON "reviews" ("product_id");

CREATE INDEX IF NOT EXISTS "reviews_user_id_idx"
  ON "reviews" ("user_id");

-- collections
CREATE INDEX IF NOT EXISTS "collections_parent_id_idx"
  ON "collections" ("parent_id");

-- product_pairings
CREATE INDEX IF NOT EXISTS "product_pairings_paired_product_id_idx"
  ON "product_pairings" ("paired_product_id");

-- wishlist_items
CREATE INDEX IF NOT EXISTS "wishlist_items_variant_id_idx"
  ON "wishlist_items" ("variant_id");
