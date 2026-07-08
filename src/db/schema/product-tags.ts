import { pgTable, uuid, primaryKey, index } from "drizzle-orm/pg-core"
import { products } from "./products"
import { tags } from "./tags"

export const productTags = pgTable("product_tags", {
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  tagId: uuid("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
}, (t) => [
  primaryKey({ columns: [t.productId, t.tagId] }),
  index("product_tags_product_id_idx").on(t.productId),
])
