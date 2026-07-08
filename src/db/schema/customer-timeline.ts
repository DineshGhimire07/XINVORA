import { pgTable, uuid, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core"
import { users } from "./users"

export const customerTimeline = pgTable("customer_timeline", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  description: varchar("description", { length: 500 }),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("timeline_user_created_idx").on(table.userId, table.createdAt),
])
