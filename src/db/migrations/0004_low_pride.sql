CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'SUSPENDED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."customer_tier" AS ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('DESKTOP', 'MOBILE', 'TABLET');--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('VIEW', 'CART_ADD', 'PURCHASE', 'WISHLIST', 'RETURN');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('UNVERIFIED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'FULLY_VERIFIED');--> statement-breakpoint
CREATE TYPE "public"."municipality_type" AS ENUM('METROPOLITAN', 'SUBMETROPOLITAN', 'MUNICIPALITY', 'RURAL_MUNICIPALITY');--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'PENDING' BEFORE 'PENDING_PAYMENT';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'PAYMENT_PENDING_VERIFICATION' BEFORE 'PAID';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'CONFIRMED' BEFORE 'PROCESSING';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'PACKED' BEFORE 'SHIPPED';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'OUT_FOR_DELIVERY' BEFORE 'DELIVERED';--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"target_user_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_dlq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"error_message" varchar(500) NOT NULL,
	"error_stack" varchar(2000),
	"failed_at" timestamp DEFAULT now() NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cdp_settings" (
	"key" varchar(50) PRIMARY KEY NOT NULL,
	"value" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_metrics" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"lifetime_spend" bigint DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'NPR' NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"average_order_value" bigint DEFAULT 0 NOT NULL,
	"wishlist_count" integer DEFAULT 0 NOT NULL,
	"cart_count" integer DEFAULT 0 NOT NULL,
	"return_rate" integer DEFAULT 0 NOT NULL,
	"refund_rate" integer DEFAULT 0 NOT NULL,
	"session_count" integer DEFAULT 0 NOT NULL,
	"average_session_duration" integer DEFAULT 0 NOT NULL,
	"last_purchase_at" timestamp,
	"last_visit_at" timestamp,
	"favorite_category" varchar(50),
	"favorite_brand" varchar(50),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" varchar(500),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nepal_provinces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "nepal_provinces_name_unique" UNIQUE("name"),
	CONSTRAINT "nepal_provinces_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "nepal_districts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"province_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "nepal_municipalities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"district_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"type" "municipality_type" NOT NULL,
	"total_wards" integer DEFAULT 9 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "settings_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_key" varchar(100) NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb NOT NULL,
	"changed_by" uuid,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"old_status" varchar(50),
	"new_status" varchar(50),
	"performed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_key" varchar(255) NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"device_type" "device_type" NOT NULL,
	"browser" varchar(50) NOT NULL,
	"operating_system" varchar(50) NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"country_code" varchar(2),
	"region" varchar(100),
	"city" varchar(100),
	"timezone" varchar(50),
	"utm_source" varchar(50),
	"utm_medium" varchar(50),
	"utm_campaign" varchar(50),
	CONSTRAINT "user_sessions_session_key_unique" UNIQUE("session_key")
);
--> statement-breakpoint
CREATE TABLE "user_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid,
	"event_type" varchar(50) NOT NULL,
	"product_id" uuid,
	"category_id" uuid,
	"order_id" uuid,
	"page" varchar(2083) NOT NULL,
	"referrer" varchar(2083),
	"device" "device_type" NOT NULL,
	"country" varchar(2),
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	"processing_duration_ms" integer DEFAULT 0 NOT NULL,
	"source" varchar(30) DEFAULT 'WEB' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "recommendation_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"brand_name" varchar(100),
	"category_slug" varchar(100),
	"views_count" integer DEFAULT 0 NOT NULL,
	"wishlist_adds_count" integer DEFAULT 0 NOT NULL,
	"cart_adds_count" integer DEFAULT 0 NOT NULL,
	"purchases_count" integer DEFAULT 0 NOT NULL,
	"returns_count" integer DEFAULT 0 NOT NULL,
	"last_interaction_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "phone" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "full_name" varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "province_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "district_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "municipality_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "ward_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "tole" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "street" varchar(255);--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "landmark" varchar(255);--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "delivery_note" varchar(1000);--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "internal_id" integer NOT NULL GENERATED ALWAYS AS IDENTITY (sequence name "orders_internal_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "invoice_number" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "idempotency_key" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" varchar(50) DEFAULT 'COD' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_proof_url" varchar(1000);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "account_status" "account_status" DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "verification_status" "verification_status" DEFAULT 'UNVERIFIED' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "loyalty_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "customer_tier" "customer_tier" DEFAULT 'BRONZE' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "marketing_source" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "referral_source" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cached_segment" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "risk_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "fraud_flag" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_metrics" ADD CONSTRAINT "customer_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_timeline" ADD CONSTRAINT "customer_timeline_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nepal_districts" ADD CONSTRAINT "nepal_districts_province_id_nepal_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."nepal_provinces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nepal_municipalities" ADD CONSTRAINT "nepal_municipalities_district_id_nepal_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."nepal_districts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings_history" ADD CONSTRAINT "settings_history_setting_key_app_settings_key_fk" FOREIGN KEY ("setting_key") REFERENCES "public"."app_settings"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings_history" ADD CONSTRAINT "settings_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_activity" ADD CONSTRAINT "order_activity_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_activity" ADD CONSTRAINT "order_activity_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_session_id_user_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_signals" ADD CONSTRAINT "recommendation_signals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_admin_idx" ON "admin_audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "admin_audit_logs" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "timeline_user_created_idx" ON "customer_timeline" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "nepal_provinces_sort_order_idx" ON "nepal_provinces" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "nepal_districts_province_id_idx" ON "nepal_districts" USING btree ("province_id");--> statement-breakpoint
CREATE INDEX "nepal_municipalities_district_id_idx" ON "nepal_municipalities" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "settings_history_key_idx" ON "settings_history" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "settings_history_changed_at_idx" ON "settings_history" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "order_activity_order_id_idx" ON "order_activity" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_activity_created_at_idx" ON "order_activity" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_started_idx" ON "user_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "session_key_uidx" ON "user_sessions" USING btree ("session_key");--> statement-breakpoint
CREATE INDEX "event_session_idx" ON "user_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "event_user_type_created_idx" ON "user_events" USING btree ("user_id","event_type","created_at");--> statement-breakpoint
CREATE INDEX "event_product_idx" ON "user_events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "event_order_idx" ON "user_events" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "event_created_idx" ON "user_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_product_signal_uidx" ON "recommendation_signals" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "user_brand_affinity_idx" ON "recommendation_signals" USING btree ("user_id","brand_name");--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_province_id_nepal_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."nepal_provinces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_district_id_nepal_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."nepal_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_municipality_id_nepal_municipalities_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."nepal_municipalities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addresses_user_id_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "products_name_trgm_idx" ON "products" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_desc_trgm_idx" ON "products" USING gin ("description" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "label";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "line1";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "line2";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "postal_code";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "is_default_shipping";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "is_default_billing";--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_internal_id_unique" UNIQUE("internal_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_invoice_number_unique" UNIQUE("invoice_number");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key");