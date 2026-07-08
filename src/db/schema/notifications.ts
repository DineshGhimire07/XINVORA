import { pgTable, uuid, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core"
import { users } from "./users"

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("INFO").notNull(), // INFO, ORDER_UPDATE, PROMO
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
