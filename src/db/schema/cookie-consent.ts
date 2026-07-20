import { pgTable, uuid, varchar, boolean, timestamp, text, jsonb, index } from "drizzle-orm/pg-core"
import { users } from "./users"

/**
 * cookieConsents — Legal record of user consent choices
 */
export const cookieConsents = pgTable(
  "cookie_consents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    consentVersion: varchar("consent_version", { length: 20 }).notNull().default("1.0"),
    necessary: boolean("necessary").notNull().default(true),
    analytics: boolean("analytics").notNull().default(false),
    marketing: boolean("marketing").notNull().default(false),
    personalization: boolean("personalization").notNull().default(false),
    consentSource: varchar("consent_source", { length: 30 }).notNull().default("banner"), // banner, preferences, checkout, account_settings, api, admin
    consentMethod: varchar("consent_method", { length: 30 }).notNull().default("accept_all"), // accept_all, reject_optional, custom
    isActive: boolean("is_active").notNull().default(true),
    withdrawnAt: timestamp("withdrawn_at"),
    deletedAt: timestamp("deleted_at"),
    consentGivenAt: timestamp("consent_given_at").defaultNow().notNull(),
    country: varchar("country", { length: 10 }),
    region: varchar("region", { length: 50 }),
    timezone: varchar("timezone", { length: 50 }),
    locale: varchar("locale", { length: 20 }),
    ipHash: varchar("ip_hash", { length: 64 }), // SHA-256(IP + server_secret)
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("cookie_consents_user_id_idx").on(table.userId),
    index("cookie_consents_created_at_idx").on(table.createdAt),
    index("cookie_consents_updated_at_idx").on(table.updatedAt),
    index("cookie_consents_ip_hash_idx").on(table.ipHash),
  ]
)

/**
 * cookieConsentAuditLogs — Immutability audit history for every consent change
 */
export const cookieConsentAuditLogs = pgTable(
  "cookie_consent_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    consentId: uuid("consent_id").references(() => cookieConsents.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values").notNull(),
    action: varchar("action", { length: 30 }).notNull(), // CREATE, UPDATE, WITHDRAW, VERSION_BUMP, SYNC_MERGE
    ipHash: varchar("ip_hash", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("cookie_consent_audit_logs_consent_id_idx").on(table.consentId),
    index("cookie_consent_audit_logs_user_id_idx").on(table.userId),
    index("cookie_consent_audit_logs_created_at_idx").on(table.createdAt),
  ]
)

/**
 * cookiePolicyVersions — Policy versioning history with complete policy snapshots
 */
export const cookiePolicyVersions = pgTable(
  "cookie_policy_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    version: varchar("version", { length: 20 }).notNull().unique(),
    description: text("description").notNull(),
    policySnapshot: jsonb("policy_snapshot").notNull(), // Rendered or structured policy definition at publish time
    requiresReconsent: boolean("requires_reconsent").notNull().default(true),
    publishedBy: uuid("published_by").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at").defaultNow().notNull(),
  },
  (table) => [
    index("cookie_policy_versions_version_idx").on(table.version),
  ]
)
