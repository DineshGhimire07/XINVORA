import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, integer, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core"

export const darazJobStatusEnum = pgEnum("daraz_job_status", [
  "PENDING",
  "READING_FOLDER",
  "VALIDATING",
  "UPLOADING_IMAGES",
  "SUBMITTING_LISTING",
  "CHECKING_QC",
  "COMPLETED",
  "FAILED",
  "PAUSED"
])

export const darazListingStatusEnum = pgEnum("daraz_listing_status", [
  "DRAFT",
  "VALIDATED",
  "IMAGES_UPLOADED",
  "SUBMITTED",
  "PENDING_QC",
  "QC_APPROVED",
  "QC_REJECTED",
  "FAILED"
])

/**
 * 1. Daraz Store OAuth Connection
 * Holds encrypted access/refresh tokens for the seller store.
 */
export const darazConnections = pgTable("daraz_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  sellerId: varchar("seller_id", { length: 100 }),
  name: varchar("name", { length: 255 }),
  account: varchar("account", { length: 255 }),
  country: varchar("country", { length: 10 }).default("np").notNull(),
  // Tokens are encrypted using AES-256-GCM
  encryptedAccessToken: text("encrypted_access_token").notNull(),
  encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
  accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("daraz_conn_seller_idx").on(table.sellerId),
])

/**
 * 2. Daraz Category Templates
 * Stores category hierarchy, mandatory and optional attributes schema retrieved from Daraz.
 */
export const darazCategoryTemplates = pgTable("daraz_category_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  darazCategoryId: varchar("daraz_category_id", { length: 100 }).notNull().unique(),
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  categoryPath: text("category_path"),
  isLeaf: boolean("is_leaf").default(true).notNull(),
  attributesSchema: jsonb("attributes_schema").notNull(), // Raw attributes from /category/attributes/get
  fieldMappings: jsonb("field_mappings"), // Custom field mapping presets (e.g. Markdown frontmatter -> Daraz attribute)
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("daraz_cat_tmpl_id_idx").on(table.darazCategoryId),
])

/**
 * 3. Daraz Product Submissions
 * Tracks each listing attempted or published to Daraz.
 */
export const darazProductSubmissions = pgTable("daraz_product_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  localProductId: varchar("local_product_id", { length: 100 }).notNull(), // e.g. PRODUCT_001
  sellerSku: varchar("seller_sku", { length: 255 }).notNull().unique(),
  darazItemId: varchar("daraz_item_id", { length: 100 }), // Returned by Daraz API after creation
  title: varchar("title", { length: 500 }).notNull(),
  darazCategoryId: varchar("daraz_category_id", { length: 100 }).notNull(),
  status: darazListingStatusEnum("status").default("DRAFT").notNull(),
  qcStatus: varchar("qc_status", { length: 100 }), // approved, rejected, pending
  qcReason: text("qc_reason"),
  submittedPayload: text("submitted_payload"), // Request XML or JSON payload
  darazResponse: jsonb("daraz_response"), // Full API response
  errorLog: text("error_log"),
  retryCount: integer("retry_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("daraz_sub_sku_idx").on(table.sellerSku),
  index("daraz_sub_local_id_idx").on(table.localProductId),
  index("daraz_sub_status_idx").on(table.status),
])

/**
 * 4. Daraz Image Cache
 * Maps local image file hash to uploaded Daraz CDN URL to prevent duplicate uploads.
 */
export const darazImageCache = pgTable("daraz_image_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileHash: varchar("file_hash", { length: 64 }).notNull().unique(), // SHA-256 of image content
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  darazUrl: text("daraz_url").notNull(),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("daraz_img_hash_idx").on(table.fileHash),
])

/**
 * 5. Durable Queue Jobs
 * Persists batch processing tasks so work can pause, resume, and survive restarts.
 */
export const darazQueueJobs = pgTable("daraz_queue_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: varchar("batch_id", { length: 100 }).notNull(),
  localProductId: varchar("local_product_id", { length: 100 }).notNull(),
  folderPath: text("folder_path").notNull(),
  status: darazJobStatusEnum("status").default("PENDING").notNull(),
  currentStep: varchar("current_step", { length: 100 }),
  progressPercent: integer("progress_percent").default(0).notNull(),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // Parsed listing details, image file paths
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("daraz_queue_batch_idx").on(table.batchId),
  index("daraz_queue_status_idx").on(table.status),
  uniqueIndex("daraz_queue_batch_product_idx").on(table.batchId, table.localProductId),
])

/**
 * 6. Daraz Audit Logs
 * Comprehensive audit trail of all API communications with Daraz Open Platform.
 */
export const darazAuditLogs = pgTable("daraz_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  action: varchar("action", { length: 100 }).notNull(), // e.g. /category/tree/get, /auth/token/create
  status: varchar("status", { length: 20 }).notNull(), // SUCCESS, ERROR
  statusCode: integer("status_code"),
  requestParams: jsonb("request_params"),
  responseBody: jsonb("response_body"),
  errorMessage: text("error_message"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("daraz_audit_action_idx").on(table.action),
  index("daraz_audit_created_idx").on(table.createdAt),
])
