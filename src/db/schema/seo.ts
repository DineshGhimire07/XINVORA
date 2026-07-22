import { pgTable, uuid, varchar, integer, boolean, text, jsonb, timestamp, index } from "drizzle-orm/pg-core"

/**
 * Persistent SEO Issues discovered by site audits
 */
export const seoIssues = pgTable(
  "seo_issues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entityType: varchar("entity_type", { length: 50 }).notNull(), // PRODUCT, COLLECTION, JOURNAL, LOOKBOOK, CMS_PAGE
    entityId: varchar("entity_id", { length: 100 }).notNull(),
    ruleId: varchar("rule_id", { length: 100 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(), // METADATA, CONTENT, SCHEMA, IMAGES, LINKS, INDEXING, PERFORMANCE, ACCESSIBILITY
    severity: varchar("severity", { length: 20 }).default("MEDIUM").notNull(), // HIGH, MEDIUM, LOW
    message: text("message").notNull(),
    impact: text("impact"),
    fixStrategies: jsonb("fix_strategies").default([]).notNull(),
    status: varchar("status", { length: 20 }).default("OPEN").notNull(), // OPEN, RESOLVED, IGNORED
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => [
    index("seo_issues_entity_idx").on(table.entityType, table.entityId),
    index("seo_issues_rule_idx").on(table.ruleId),
    index("seo_issues_status_idx").on(table.status),
    index("seo_issues_severity_idx").on(table.severity),
  ]
)

/**
 * Site Page Content Snapshots for fast analysis without HTML re-crawling
 */
export const seoPageSnapshots = pgTable(
  "seo_page_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    url: varchar("url", { length: 1024 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }).notNull(),
    title: varchar("title", { length: 500 }),
    metaDescription: text("meta_description"),
    headings: jsonb("headings").default([]).notNull(),
    links: jsonb("links").default([]).notNull(),
    images: jsonb("images").default([]).notNull(),
    schemaData: jsonb("schema_data").default({}).notNull(),
    htmlHash: varchar("html_hash", { length: 64 }),
    snapshotVersion: integer("snapshot_version").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("seo_snapshots_url_idx").on(table.url),
    index("seo_snapshots_entity_idx").on(table.entityType, table.entityId),
  ]
)

/**
 * 301, 302, 410 Redirect Rules
 */
export const seoRedirects = pgTable(
  "seo_redirects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceUrl: varchar("source_url", { length: 1024 }).notNull().unique(),
    targetUrl: varchar("target_url", { length: 1024 }).notNull(),
    statusCode: integer("status_code").default(301).notNull(), // 301, 302, 410
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("seo_redirects_source_idx").on(table.sourceUrl),
    index("seo_redirects_active_idx").on(table.isActive),
  ]
)

/**
 * High-concurrency Redirect Hits Audit Log
 */
export const seoRedirectEvents = pgTable(
  "seo_redirect_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    redirectId: uuid("redirect_id").references(() => seoRedirects.id, { onDelete: "cascade" }).notNull(),
    referer: varchar("referer", { length: 1024 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("seo_redirect_events_redirect_idx").on(table.redirectId),
    index("seo_redirect_events_created_at_idx").on(table.createdAt),
  ]
)

/**
 * Historical Site Audit Performance Snapshots
 */
export const seoAuditHistory = pgTable(
  "seo_audit_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    overallScore: integer("overall_score").notNull(),
    indexedPages: integer("indexed_pages").notNull(),
    issuesSnapshot: jsonb("issues_snapshot").default({}).notNull(),
    improvementsLog: jsonb("improvements_log").default([]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("seo_audit_history_created_at_idx").on(table.createdAt),
  ]
)
