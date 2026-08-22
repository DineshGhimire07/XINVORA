import { pgTable, uuid, varchar, text, timestamp, boolean, integer, index, uniqueIndex } from "drizzle-orm/pg-core"
import { collections } from "./collections"

/**
 * Standard registry of supported semantic image roles and their immutable human-readable display labels.
 */
export const SUPPORTED_IMAGE_ROLES = [
  { role: "lifestyle", label: "Lifestyle" },
  { role: "front_closeup", label: "Front Close-Up" },
  { role: "front", label: "Front" },
  { role: "back", label: "Back" },
  { role: "detail", label: "Detail" },
  { role: "side", label: "Side" },
  { role: "model", label: "Model" },
  { role: "full_view", label: "Full View" },
  { role: "product_view", label: "Product View" },
  { role: "editorial", label: "Editorial" },
  { role: "campaign", label: "Campaign" },
] as const

export type ImageRoleType = typeof SUPPORTED_IMAGE_ROLES[number]["role"]

export const collectionImageRoleTemplates = pgTable("collection_image_role_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectionId: uuid("collection_id").references(() => collections.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("cirt_collection_id_idx").on(table.collectionId),
])

export const collectionImageRoles = pgTable("collection_image_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").references(() => collectionImageRoleTemplates.id, { onDelete: "cascade" }).notNull(),
  position: integer("position").notNull(), // 1-indexed: 1, 2, 3, 4...
  role: varchar("role", { length: 50 }).notNull(), // e.g. "lifestyle", "front_closeup", "front", "back"
  label: varchar("label", { length: 100 }).notNull(), // e.g. "Lifestyle", "Front Close-Up", "Front", "Back"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("cir_template_id_idx").on(table.templateId),
  uniqueIndex("cir_template_position_uidx").on(table.templateId, table.position),
])
