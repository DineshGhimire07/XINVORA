import { pgTable, uuid, varchar, text, timestamp, boolean, AnyPgColumn } from "drizzle-orm/pg-core"

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 1024 }),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id), // Self-referential
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
})
