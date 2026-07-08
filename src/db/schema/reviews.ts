import { pgTable, uuid, varchar, integer, text, boolean, timestamp } from "drizzle-orm/pg-core"
import { products } from "./products"
import { users } from "./users"
import { reviewStatusEnum } from "./enums"

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  body: text("body"),
  isVerified: boolean("is_verified").default(false).notNull(),
  status: reviewStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
})
