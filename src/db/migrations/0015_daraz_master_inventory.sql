-- Migration 0015: Daraz Master Inventory & Catalog Replacement Architecture
-- Adds legacy archival flags, Daraz master mapping table, sync logs, and stock reservation controls.

-- 1. Add archival and master source flags to core products table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_legacy_archived" boolean DEFAULT false NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_daraz_master" boolean DEFAULT false NOT NULL;

CREATE INDEX IF NOT EXISTS "products_legacy_archived_idx" ON "products" ("is_legacy_archived");
CREATE INDEX IF NOT EXISTS "products_daraz_master_idx" ON "products" ("is_daraz_master");

-- 2. Create daraz_synced_products table
CREATE TABLE IF NOT EXISTS "daraz_synced_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daraz_item_id" varchar(100) NOT NULL,
	"sku_id" varchar(100) NOT NULL,
	"seller_sku" varchar(255) NOT NULL,
	"shop_sku" varchar(255),
	"title" varchar(500) NOT NULL,
	"description" text,
	"short_description" text,
	"primary_category_id" varchar(100),
	"category_name" varchar(255),
	"brand" varchar(255),
	"daraz_original_price" numeric(10, 2) NOT NULL,
	"daraz_special_price" numeric(10, 2),
	"special_price_start" timestamp with time zone,
	"special_price_end" timestamp with time zone,
	"effective_daraz_price" numeric(10, 2) NOT NULL,
	"website_calculated_price" numeric(10, 2) NOT NULL,
	"website_override_price" numeric(10, 2),
	"applied_discount_percentage" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"is_manual_price_override" boolean DEFAULT false NOT NULL,
	"daraz_stock" integer DEFAULT 0 NOT NULL,
	"pending_reservations" integer DEFAULT 0 NOT NULL,
	"website_available_stock" integer DEFAULT 0 NOT NULL,
	"media_sync_status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"daraz_raw_images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cloudinary_images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"product_status" varchar(50) DEFAULT 'Active' NOT NULL,
	"is_published_on_website" boolean DEFAULT false NOT NULL,
	"website_product_id" uuid,
	"website_variant_id" uuid,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sync_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daraz_synced_products_website_product_id_products_id_fk" FOREIGN KEY ("website_product_id") REFERENCES "products"("id") ON DELETE set null ON UPDATE no action,
	CONSTRAINT "daraz_synced_products_website_variant_id_variants_id_fk" FOREIGN KEY ("website_variant_id") REFERENCES "variants"("id") ON DELETE set null ON UPDATE no action
);

-- Compound unique constraint for stable Daraz identity: (Item ID + SKU ID)
CREATE UNIQUE INDEX IF NOT EXISTS "daraz_sync_item_sku_uidx" ON "daraz_synced_products" ("daraz_item_id", "sku_id");
CREATE INDEX IF NOT EXISTS "daraz_sync_sku_idx" ON "daraz_synced_products" ("seller_sku");
CREATE INDEX IF NOT EXISTS "daraz_sync_item_id_idx" ON "daraz_synced_products" ("daraz_item_id");
CREATE INDEX IF NOT EXISTS "daraz_sync_media_status_idx" ON "daraz_synced_products" ("media_sync_status");
CREATE INDEX IF NOT EXISTS "daraz_sync_status_idx" ON "daraz_synced_products" ("product_status");
CREATE INDEX IF NOT EXISTS "daraz_sync_published_idx" ON "daraz_synced_products" ("is_published_on_website");
CREATE INDEX IF NOT EXISTS "daraz_sync_web_product_idx" ON "daraz_synced_products" ("website_product_id");

-- 3. Create daraz_sync_logs table
CREATE TABLE IF NOT EXISTS "daraz_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sync_type" varchar(50) NOT NULL,
	"daraz_item_id" varchar(100),
	"seller_sku" varchar(255),
	"previous_values" jsonb,
	"updated_values" jsonb,
	"status" varchar(20) NOT NULL,
	"details" text,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "daraz_sync_log_sku_idx" ON "daraz_sync_logs" ("seller_sku");
CREATE INDEX IF NOT EXISTS "daraz_sync_log_item_idx" ON "daraz_sync_logs" ("daraz_item_id");
CREATE INDEX IF NOT EXISTS "daraz_sync_log_status_idx" ON "daraz_sync_logs" ("status");
CREATE INDEX IF NOT EXISTS "daraz_sync_log_created_idx" ON "daraz_sync_logs" ("created_at");

-- 4. Create daraz_stock_reservations table
CREATE TABLE IF NOT EXISTS "daraz_stock_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar(100),
	"variant_id" uuid,
	"seller_sku" varchar(255) NOT NULL,
	"reserved_quantity" integer DEFAULT 1 NOT NULL,
	"status" varchar(50) DEFAULT 'HELD' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daraz_stock_reservations_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "daraz_stock_res_sku_idx" ON "daraz_stock_reservations" ("seller_sku");
CREATE INDEX IF NOT EXISTS "daraz_stock_res_status_idx" ON "daraz_stock_reservations" ("status");
CREATE INDEX IF NOT EXISTS "daraz_stock_res_expires_idx" ON "daraz_stock_reservations" ("expires_at");
