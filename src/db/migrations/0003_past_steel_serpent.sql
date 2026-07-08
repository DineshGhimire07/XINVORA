ALTER TABLE "collections" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "seo_title" varchar(255);--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "media_library" ADD COLUMN "provider" varchar(50) DEFAULT 'cloudinary' NOT NULL;--> statement-breakpoint
ALTER TABLE "media_library" ADD COLUMN "provider_id" varchar(255);