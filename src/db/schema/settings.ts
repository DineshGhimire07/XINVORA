import { pgTable, uuid, varchar, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core"
import { users } from "./users"

export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: jsonb("value").notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id),
})

export const settingsHistory = pgTable("settings_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().references(() => appSettings.key, { onDelete: 'cascade' }),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value").notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
}, (table) => [
  index("settings_history_key_idx").on(table.settingKey),
  index("settings_history_changed_at_idx").on(table.changedAt),
])
