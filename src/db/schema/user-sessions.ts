import { pgTable, uuid, varchar, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core"
import { users } from "./users"
import { deviceTypeEnum } from "./enums"

export const userSessions = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // Nullable for guests
  sessionKey: varchar("session_key", { length: 255 }).notNull().unique(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  
  // Device & Client Information
  deviceType: deviceTypeEnum("device_type").notNull(), // DESKTOP, MOBILE, TABLET
  browser: varchar("browser", { length: 50 }).notNull(),
  operatingSystem: varchar("operating_system", { length: 50 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  
  // GeoIP Attributes
  countryCode: varchar("country_code", { length: 2 }), // ISO 3166-1 alpha-2
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  timezone: varchar("timezone", { length: 50 }),
  
  // Acquisition UTM Parameters
  utmSource: varchar("utm_source", { length: 50 }),
  utmMedium: varchar("utm_medium", { length: 50 }),
  utmCampaign: varchar("utm_campaign", { length: 50 }),
}, (table) => [
  index("session_user_idx").on(table.userId),
  index("session_started_idx").on(table.startedAt),
  uniqueIndex("session_key_uidx").on(table.sessionKey),
])
