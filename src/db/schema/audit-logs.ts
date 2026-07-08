import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core"
import { users } from "./users"

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // CREATE, UPDATE, DELETE, PUBLISH, etc.
  entityType: varchar("entity_type", { length: 100 }).notNull(), // PRODUCT, ORDER, CATEGORY, etc.
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
