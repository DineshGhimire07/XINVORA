ALTER TABLE "collections" ADD COLUMN "banner_url" varchar(1024);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "invoice_printed_at" timestamp;--> statement-breakpoint
ALTER TABLE "homepage_settings" DROP COLUMN "featured_product_ids";