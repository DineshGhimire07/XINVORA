import { pgTable, uuid, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core"

export const analyticsDlq = pgTable("analytics_dlq", {
  id: uuid("id").defaultRandom().primaryKey(),
  rawPayload: jsonb("raw_payload").notNull(),
  errorMessage: varchar("error_message", { length: 500 }).notNull(),
  errorStack: varchar("error_stack", { length: 2000 }),
  failedAt: timestamp("failed_at").defaultNow().notNull(),
  resolved: boolean("resolved").default(false).notNull(),
})
