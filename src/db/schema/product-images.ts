import { pgTable, uuid, varchar, integer, timestamp, index } from "drizzle-orm/pg-core"
import { products } from "./products"

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("product_images_product_id_idx").on(table.productId),
])
