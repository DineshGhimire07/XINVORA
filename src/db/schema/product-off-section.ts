import { pgTable, uuid, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { products } from "./products"

/**
 * Off Section — product-level pricing overlay.
 *
 * This is a *presentation layer* that attaches "XX% OFF" pricing metadata
 * to existing products. It does NOT duplicate products or create a second
 * pricing system. When `isOffEnabled = true`, the storefront displays:
 *   - Original Price (strikethrough)
 *   - Selling Price
 *   - OFF badge with calculated percentage
 *
 * Derived values (never stored):
 *   discountAmount  = originalPrice - sellingPrice
 *   discountPercent = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
 */
export const productOffSection = pgTable("product_off_section", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  /** The "crossed out" original price, stored in minor units (paisa) */
  originalPrice: integer("original_price").notNull(),
  /** The actual selling price customers pay, stored in minor units (paisa) */
  sellingPrice: integer("selling_price").notNull(),
  /** Controls whether the OFF badge is shown on the storefront */
  isOffEnabled: boolean("is_off_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("product_off_section_product_id_idx").on(table.productId),
])
