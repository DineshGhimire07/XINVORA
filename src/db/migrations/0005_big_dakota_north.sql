CREATE TYPE "public"."inquiry_status" AS ENUM('NEW', 'READ', 'RESPONDED');--> statement-breakpoint
CREATE TABLE "contact_inquiries" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
