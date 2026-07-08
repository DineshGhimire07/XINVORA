import { pgTable, uuid, varchar, integer, timestamp, index } from "drizzle-orm/pg-core"
import { variants } from "./variants"

export const variantImages = pgTable("variant_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "cascade" }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("variant_images_variant_id_idx").on(table.variantId),
])
