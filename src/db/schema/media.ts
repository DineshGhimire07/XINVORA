import { pgTable, uuid, timestamp, varchar, integer } from "drizzle-orm/pg-core"

export const mediaLibrary = pgTable("media_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: varchar("url", { length: 1024 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  caption: varchar("caption", { length: 1024 }),
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  mimeType: varchar("mime_type", { length: 100 }),
  provider: varchar("provider", { length: 50 }).default("cloudinary").notNull(),
  providerId: varchar("provider_id", { length: 255 }),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
