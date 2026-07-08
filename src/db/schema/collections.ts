import { pgTable, uuid, varchar, text, timestamp, boolean, integer } from "drizzle-orm/pg-core"

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"), // Foreign key added via relations or explicitly here
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 1024 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  isActive: boolean("is_active").default(true).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
})
