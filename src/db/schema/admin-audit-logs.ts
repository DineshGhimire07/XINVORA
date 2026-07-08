import { pgTable, uuid, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core"
import { users } from "./users"

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  targetUserId: uuid("target_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // SUSPEND_ACCOUNT, ACTIVATE_ACCOUNT, RESET_PASSWORD, GIVE_COUPON
  details: jsonb("details").default({}).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("audit_admin_idx").on(table.adminId),
  index("audit_target_idx").on(table.targetUserId),
  index("audit_created_idx").on(table.createdAt),
])
