import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core"
import { users } from "./users"

export const journalCategories = pgTable("journal_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
})

export const journalPosts = pgTable("journal_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(), // markdown or html
  coverImage: varchar("cover_image", { length: 1024 }),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  categoryId: uuid("category_id").references(() => journalCategories.id),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
})
