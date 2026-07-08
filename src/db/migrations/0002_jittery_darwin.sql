CREATE TYPE "public"."announcement_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."block_type" AS ENUM('HERO', 'RICHTEXT', 'IMAGE', 'VIDEO', 'PRODUCT_GRID', 'COLLECTION_GRID', 'JOURNAL_GRID', 'FAQ', 'NEWSLETTER', 'DIVIDER', 'SPACER', 'BUTTON_GROUP', 'GALLERY', 'QUOTE', 'BANNER');--> statement-breakpoint
CREATE TYPE "public"."page_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('PERCENTAGE', 'FIXED_AMOUNT');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('NONE', 'KHALTI', 'ESEWA', 'STRIPE', 'PAYPAL', 'DUMMY', 'MANUAL', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."menu_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'NEW' BEFORE 'PENDING';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'INITIATED' BEFORE 'PENDING';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'AUTHORIZED' BEFORE 'PAID';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'CANCELLED' BEFORE 'REFUNDED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'PARTIALLY_REFUNDED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'EXPIRED';--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"background_color" varchar(50) DEFAULT 'bg-text-primary',
	"text_color" varchar(50) DEFAULT 'text-surface',
	"button_text" varchar(100),
	"button_url" varchar(255),
	"status" "announcement_status" DEFAULT 'DRAFT' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"type" "block_type" NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"seo_title" varchar(255),
	"seo_description" text,
	"status" "page_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cms_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cms_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hero_rotation" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured_collection_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured_product_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"newsletter_toggle" boolean DEFAULT true NOT NULL,
	"layout_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" integer NOT NULL,
	"min_order_amount" integer,
	"max_discount_amount" integer,
	"max_uses" integer,
	"uses_per_user" integer DEFAULT 1,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"applicable_categories" jsonb,
	"applicable_products" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"provider_payment_id" varchar(255),
	"status" "payment_status" NOT NULL,
	"amount" integer NOT NULL,
	"currency" "currency" NOT NULL,
	"failure_reason" varchar(1000),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"session_expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "media_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" varchar(1024) NOT NULL,
	"title" varchar(255) NOT NULL,
	"alt_text" varchar(255),
	"caption" varchar(1024),
	"width" integer,
	"height" integer,
	"size_bytes" integer,
	"mime_type" varchar(100),
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_id" uuid NOT NULL,
	"parent_id" uuid,
	"label" varchar(255) NOT NULL,
	"url" varchar(1024),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation_menus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"handle" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "menu_status" DEFAULT 'DRAFT' NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "navigation_menus_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone" varchar(50),
	"date_of_birth" date,
	"profile_image" varchar(500),
	"newsletter_preference" boolean DEFAULT false NOT NULL,
	"language_preference" varchar(10) DEFAULT 'en' NOT NULL,
	"timezone" varchar(100) DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) DEFAULT 'INFO' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT'::text;--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'FAILED');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";--> statement-breakpoint
ALTER TABLE "materials" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "is_default_shipping" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "is_default_billing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_method" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "estimated_delivery" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tax_rate" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "currency" "currency" NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "discount_applied" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "tax_applied" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_blocks" ADD CONSTRAINT "cms_blocks_section_id_cms_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."cms_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_sections" ADD CONSTRAINT "cms_sections_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_navigation_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."navigation_menus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_menu_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_coupon_id_idx" ON "orders" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");