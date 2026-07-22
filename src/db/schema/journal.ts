import { pgTable, uuid, varchar, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core"
import { users } from "./users"

export const journalCategories = pgTable("journal_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const journalTags = pgTable("journal_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const journalPosts = pgTable("journal_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  body: jsonb("body").default([]).notNull(), // structured blocks array
  coverImage: varchar("cover_image", { length: 1024 }),
  gallery: jsonb("gallery").default([]), // array of image object metadata
  authorId: uuid("author_id").references(() => users.id).notNull(),
  categoryId: uuid("category_id").references(() => journalCategories.id),
  
  // Publication Status & Settings
  workflowState: varchar("workflow_state", { length: 50 }).default("DRAFT").notNull(), // DRAFT, REVIEW, APPROVED, SCHEDULED, PUBLISHED, ARCHIVED
  visibility: varchar("visibility", { length: 50 }).default("PUBLIC").notNull(), // PUBLIC, PRIVATE, PASSWORD
  isFeatured: boolean("is_featured").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  allowComments: boolean("allow_comments").default(true).notNull(),
  readingTimeOverride: integer("reading_time_override"),
  
  // Translation
  locale: varchar("locale", { length: 10 }).default("en").notNull(),
  translationGroupId: uuid("translation_group_id"),

  // SEO Fields
  seoTitle: varchar("seo_title", { length: 255 }),
  metaDescription: text("meta_description"),
  canonicalUrl: varchar("canonical_url", { length: 1024 }),
  ogTitle: varchar("og_title", { length: 255 }),
  ogDescription: text("og_description"),
  ogImage: varchar("og_image", { length: 1024 }),
  twitterTitle: varchar("twitter_title", { length: 255 }),
  twitterDescription: text("twitter_description"),
  twitterImage: varchar("twitter_image", { length: 1024 }),
  robotsIndex: boolean("robots_index").default(true).notNull(),
  robotsFollow: boolean("robots_follow").default(true).notNull(),
  focusKeyword: varchar("focus_keyword", { length: 255 }),
  structuredData: jsonb("structured_data"),

  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
})

export const journalPostTags = pgTable("journal_post_tags", {
  postId: uuid("post_id").references(() => journalPosts.id, { onDelete: "cascade" }).notNull(),
  tagId: uuid("tag_id").references(() => journalTags.id, { onDelete: "cascade" }).notNull(),
}, (table) => [
  {
    pk: {
      name: "journal_post_tags_pk",
      columns: [table.postId, table.tagId],
    }
  }
])

export const journalRevisions = pgTable("journal_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => journalPosts.id, { onDelete: "cascade" }).notNull(),
  revisionData: jsonb("revision_data").notNull(), // Git-style full document snapshot
  changedById: uuid("changed_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const journalViews = pgTable("journal_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => journalPosts.id, { onDelete: "cascade" }).notNull(),
  anonymousId: varchar("anonymous_id", { length: 100 }),
  ipHash: varchar("ip_hash", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
