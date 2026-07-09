import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { categories } from "./categories"
import { brands } from "./brands"
import { productStatusEnum } from "./enums"

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  /** Short badge label shown overlay top-left of main PDP image. e.g. "NEW" or "EDITOR'S PICK" */
  badge: varchar("badge", { length: 50 }),
  /** Per-product Details text shown in the DETAILS accordion row (composition, craftsmanship, etc.) */
  details: text("details"),
  /** Per-product Care Guide text shown in the CARE GUIDE accordion row */
  careGuide: text("care_guide"),
  /** Per-product Size Guide text shown in the Size Guide modal on PDP */
  sizeGuide: text("size_guide"),
  /** Optional Instagram Reel URL — when set, shows the "Seen on Instagram" card on PDP */
  instagramReelUrl: varchar("instagram_reel_url", { length: 500 }),
  /** Optional AI try-on prompt — when set, shows the Virtual Try-On guide on PDP */
  virtualTryonPrompt: text("virtual_tryon_prompt"),
  /** Short Description displayed above the fold in the purchase section */
  shortDescription: text("short_description"),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "restrict" }).notNull(),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  status: productStatusEnum("status").default("DRAFT").notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  // Critical index for the PLP — "list all products in category X"
  index("products_category_id_idx").on(table.categoryId),
  // Index on status for admin filtering (only PUBLISHED products in storefront)
  index("products_status_idx").on(table.status),
  // GIN trigram indexes for performant full-text search
  index("products_name_trgm_idx").using("gin", sql`${table.name} gin_trgm_ops`),
  index("products_desc_trgm_idx").using("gin", sql`${table.description} gin_trgm_ops`),
])
