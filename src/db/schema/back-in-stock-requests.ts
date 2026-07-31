import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core"
import { products } from "./products"

export const backInStockRequests = pgTable("back_in_stock_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  email: varchar("email", { length: 255 }).notNull().default(""),
  name: varchar("name", { length: 255 }).notNull().default(""),
  phone: varchar("phone", { length: 50 }).notNull().default(""),
  productName: varchar("product_name", { length: 255 }).notNull().default(""),
  notified: boolean("notified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

