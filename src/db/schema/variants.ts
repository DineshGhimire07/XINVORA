import { pgTable, uuid, boolean, timestamp, index } from "drizzle-orm/pg-core"
import { products } from "./products"
import { colors } from "./colors"
import { sizes } from "./sizes"
import { varchar } from "drizzle-orm/pg-core"

export const variants = pgTable("variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  sku: varchar("sku", { length: 255 }).notNull().unique(),
  colorId: uuid("color_id").references(() => colors.id, { onDelete: "set null" }),
  sizeId: uuid("size_id").references(() => sizes.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("variants_product_id_idx").on(table.productId),
  index("variants_color_id_idx").on(table.colorId),
  index("variants_size_id_idx").on(table.sizeId),
])
