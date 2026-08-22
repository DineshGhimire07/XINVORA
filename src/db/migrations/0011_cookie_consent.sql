-- 0011_cookie_consent.sql
-- Creates cookie consent tables matching src/db/schema/cookie-consent.ts
-- Applied to production Supabase: 2026-08-22
-- DO NOT RE-APPLY — this migration has already been executed against the production database.

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cookie_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid REFERENCES "users"("id") ON DELETE set null,
	"consent_version" varchar(20) DEFAULT '1.0' NOT NULL,
	"necessary" boolean DEFAULT true NOT NULL,
	"analytics" boolean DEFAULT false NOT NULL,
	"marketing" boolean DEFAULT false NOT NULL,
	"personalization" boolean DEFAULT false NOT NULL,
	"consent_source" varchar(30) DEFAULT 'banner' NOT NULL,
	"consent_method" varchar(30) DEFAULT 'accept_all' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"withdrawn_at" timestamp,
	"deleted_at" timestamp,
	"consent_given_at" timestamp DEFAULT now() NOT NULL,
	"country" varchar(10),
	"region" varchar(50),
	"timezone" varchar(50),
	"locale" varchar(20),
	"ip_hash" varchar(64),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cookie_consent_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consent_id" uuid REFERENCES "cookie_consents"("id") ON DELETE cascade,
	"user_id" uuid REFERENCES "users"("id") ON DELETE set null,
	"old_values" jsonb,
	"new_values" jsonb NOT NULL,
	"action" varchar(30) NOT NULL,
	"ip_hash" varchar(64),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cookie_policy_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" varchar(20) NOT NULL,
	"description" text NOT NULL,
	"policy_snapshot" jsonb NOT NULL,
	"requires_reconsent" boolean DEFAULT true NOT NULL,
	"published_by" uuid REFERENCES "users"("id") ON DELETE set null,
	"published_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cookie_policy_versions_version_unique" UNIQUE("version")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cookie_consents_user_id_idx" ON "cookie_consents" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cookie_consents_created_at_idx" ON "cookie_consents" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cookie_consents_updated_at_idx" ON "cookie_consents" ("updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cookie_consents_ip_hash_idx" ON "cookie_consents" ("ip_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cookie_consent_audit_logs_consent_id_idx" ON "cookie_consent_audit_logs" ("consent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cookie_consent_audit_logs_user_id_idx" ON "cookie_consent_audit_logs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cookie_consent_audit_logs_created_at_idx" ON "cookie_consent_audit_logs" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cookie_policy_versions_version_idx" ON "cookie_policy_versions" ("version");
