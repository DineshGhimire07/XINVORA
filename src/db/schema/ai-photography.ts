import { pgTable, uuid, varchar, text, jsonb, timestamp, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core"
import { products } from "./products"
import { variants } from "./variants"
import type { GarmentIdentity } from "@/domains/photography/contracts/identity.contract"

export const aiIdentityStatusEnum = pgEnum("ai_identity_status", ["DRAFT", "REVIEWED", "LOCKED"])

/**
 * Persists the authoritative physical garment identity and master image references
 * for a product (or product variant colorway).
 */
export const productAiIdentities = pgTable("product_ai_identities", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "cascade" }),
  status: aiIdentityStatusEnum("status").default("DRAFT").notNull(),
  masterFrontImageId: uuid("master_front_image_id"),
  masterFrontUrl: varchar("master_front_url", { length: 1024 }),
  masterBackImageId: uuid("master_back_image_id"),
  masterBackUrl: varchar("master_back_url", { length: 1024 }),
  detailImageIds: jsonb("detail_image_ids").$type<string[]>().default([]).notNull(),
  detailUrls: jsonb("detail_urls").$type<string[]>().default([]).notNull(),
  structuredIdentity: jsonb("structured_identity").$type<GarmentIdentity>(),
  rawIdentificationOutput: text("raw_identification_output"),
  lockedAt: timestamp("locked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("pai_product_id_idx").on(table.productId),
  index("pai_variant_id_idx").on(table.variantId),
  uniqueIndex("pai_product_variant_uidx").on(table.productId, table.variantId),
])

/**
 * Canonical registry of versionable photography prompt templates.
 */
export const aiPromptTemplates = pgTable("ai_prompt_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleSlug: varchar("role_slug", { length: 50 }).notNull().unique(), // e.g. "garment_identification", "product_front"
  name: varchar("name", { length: 100 }).notNull(),
  activeVersion: varchar("active_version", { length: 20 }).default("v1.0.0").notNull(),
  templateText: text("template_text").notNull(),
  defaultPhotographyDirection: text("default_photography_direction"),
  defaultBackgroundDirection: text("default_background_direction"),
  defaultCameraDirection: text("default_camera_direction"),
  defaultLightingDirection: text("default_lighting_direction"),
  defaultModelDirection: text("default_model_direction"),
  defaultPoseDirection: text("default_pose_direction"),
  defaultEnvironmentDirection: text("default_environment_direction"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/**
 * Immutable historical version ledger for prompt templates.
 */
export const aiPromptVersions = pgTable("ai_prompt_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").references(() => aiPromptTemplates.id, { onDelete: "cascade" }).notNull(),
  version: varchar("version", { length: 20 }).notNull(), // e.g. "v1.0.0", "v1.1.0"
  templateText: text("template_text").notNull(),
  changelog: text("changelog"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("apv_template_version_uidx").on(table.templateId, table.version),
])
