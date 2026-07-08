import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { wishlists } from "./wishlists"
import { variants } from "./variants"

export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  wishlistId: uuid("wishlist_id").references(() => wishlists.id, { onDelete: "cascade" }).notNull(),
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "cascade" }).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("wishlist_variant_idx").on(table.wishlistId, table.variantId),
])
