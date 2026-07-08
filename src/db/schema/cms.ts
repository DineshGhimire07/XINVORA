import { pgTable, uuid, timestamp, varchar, text, jsonb, integer, pgEnum, boolean } from "drizzle-orm/pg-core"

export const pageStatusEnum = pgEnum("page_status", ["DRAFT", "PUBLISHED", "ARCHIVED"])
export const blockTypeEnum = pgEnum("block_type", [
  "HERO",
  "RICHTEXT",
  "IMAGE",
  "VIDEO",
  "PRODUCT_GRID",
  "COLLECTION_GRID",
  "JOURNAL_GRID",
  "FAQ",
  "NEWSLETTER",
  "DIVIDER",
  "SPACER",
  "BUTTON_GROUP",
  "GALLERY",
  "QUOTE",
  "BANNER"
])

export const cmsPages = pgTable("cms_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  status: pageStatusEnum("status").notNull().default("DRAFT"),
  publishedAt: timestamp("published_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const cmsSections = pgTable("cms_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: uuid("page_id").notNull().references(() => cmsPages.id),
  name: varchar("name", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const cmsBlocks = pgTable("cms_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id").notNull().references(() => cmsSections.id),
  type: blockTypeEnum("type").notNull(),
  data: jsonb("data").notNull().default({}),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const announcementStatusEnum = pgEnum("announcement_status", ["DRAFT", "PUBLISHED", "ARCHIVED"])

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  message: text("message").notNull(),
  backgroundColor: varchar("background_color", { length: 50 }).default("bg-text-primary"),
  textColor: varchar("text_color", { length: 50 }).default("text-surface"),
  buttonText: varchar("button_text", { length: 100 }),
  buttonUrl: varchar("button_url", { length: 255 }),
  status: announcementStatusEnum("status").notNull().default("DRAFT"),
  priority: integer("priority").notNull().default(0),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const homepageSettings = pgTable("homepage_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  heroRotation: jsonb("hero_rotation").notNull().default([]), // array of block configs
  featuredCollectionIds: jsonb("featured_collection_ids").notNull().default([]), // array of collection UUIDs
  featuredProductIds: jsonb("featured_product_ids").notNull().default([]), // array of product UUIDs
  newsletterToggle: boolean("newsletter_toggle").notNull().default(true),
  layoutConfig: jsonb("layout_config").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
