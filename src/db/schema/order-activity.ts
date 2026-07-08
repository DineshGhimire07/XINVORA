import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core"
import { orders } from "./orders"
import { users } from "./users"

export const orderActivity = pgTable("order_activity", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g. "STATUS_UPDATE", "CREATED", "PAYMENT_RECEIVED"
  oldStatus: varchar("old_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }),
  performedBy: uuid("performed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("order_activity_order_id_idx").on(table.orderId),
  index("order_activity_created_at_idx").on(table.createdAt),
])
