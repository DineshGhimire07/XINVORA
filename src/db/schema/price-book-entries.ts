import { pgTable, uuid, integer, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core"
import { priceBooks } from "./price-books"
import { variants } from "./variants"

export const priceBookEntries = pgTable("price_book_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  priceBookId: uuid("price_book_id").references(() => priceBooks.id, { onDelete: "cascade" }).notNull(),
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "cascade" }).notNull(),
  price: integer("price").notNull(), // stored in minor units (cents)
  compareAtPrice: integer("compare_at_price"), // for crossed out / sale prices
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("price_book_variant_idx").on(table.priceBookId, table.variantId),
  index("price_book_entries_variant_id_idx").on(table.variantId),
])
