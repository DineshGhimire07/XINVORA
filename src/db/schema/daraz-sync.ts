import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { products } from "./products"
import { variants } from "./variants"

/**
 * 1. Daraz Synced Products
 * Core operational mapping between Daraz Master catalog items and XINVORA storefront entities.
 * Stable identity: (daraz_item_id, sku_id) composite unique key.
 */
export const darazSyncedProducts = pgTable(
  "daraz_synced_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    darazItemId: varchar("daraz_item_id", { length: 100 }).notNull(),
    skuId: varchar("sku_id", { length: 100 }).notNull(),
    sellerSku: varchar("seller_sku", { length: 255 }).notNull(),
    shopSku: varchar("shop_sku", { length: 255 }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    shortDescription: text("short_description"),
    primaryCategoryId: varchar("primary_category_id", { length: 100 }),
    categoryName: varchar("category_name", { length: 255 }),
    brand: varchar("brand", { length: 255 }),

    // Pricing Tracking (decimal-safe NPR values)
    darazOriginalPrice: numeric("daraz_original_price", { precision: 10, scale: 2 }).notNull(),
    darazSpecialPrice: numeric("daraz_special_price", { precision: 10, scale: 2 }),
    specialPriceStart: timestamp("special_price_start", { withTimezone: true }),
    specialPriceEnd: timestamp("special_price_end", { withTimezone: true }),
    effectiveDarazPrice: numeric("effective_daraz_price", { precision: 10, scale: 2 }).notNull(),
    websiteCalculatedPrice: numeric("website_calculated_price", { precision: 10, scale: 2 }).notNull(),
    websiteOverridePrice: numeric("website_override_price", { precision: 10, scale: 2 }),
    appliedDiscountPercentage: numeric("applied_discount_percentage", { precision: 5, scale: 2 })
      .default("15.00")
      .notNull(),
    isManualPriceOverride: boolean("is_manual_price_override").default(false).notNull(),

    // Stock & Inventory Tracking
    darazStock: integer("daraz_stock").default(0).notNull(),
    pendingReservations: integer("pending_reservations").default(0).notNull(),
    websiteAvailableStock: integer("website_available_stock").default(0).notNull(),

    // Media & Cloudinary Ingestion Status
    mediaSyncStatus: varchar("media_sync_status", { length: 50 }).default("PENDING").notNull(), // PENDING, PROCESSING, COMPLETED, FAILED
    darazRawImages: jsonb("daraz_raw_images").default([]).notNull(),
    cloudinaryImages: jsonb("cloudinary_images").default([]).notNull(),

    // Lifecycle & Storefront Visibility Controls
    productStatus: varchar("product_status", { length: 50 }).default("Active").notNull(),
    isPublishedOnWebsite: boolean("is_published_on_website").default(false).notNull(),

    // Relational pointers to native XINVORA storefront tables
    websiteProductId: uuid("website_product_id").references(() => products.id, { onDelete: "set null" }),
    websiteVariantId: uuid("website_variant_id").references(() => variants.id, { onDelete: "set null" }),

    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).defaultNow().notNull(),
    syncError: text("sync_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Stable composite identity: Daraz Item ID + SKU ID
    uniqueIndex("daraz_sync_item_sku_uidx").on(table.darazItemId, table.skuId),
    index("daraz_sync_sku_idx").on(table.sellerSku),
    index("daraz_sync_item_id_idx").on(table.darazItemId),
    index("daraz_sync_media_status_idx").on(table.mediaSyncStatus),
    index("daraz_sync_status_idx").on(table.productStatus),
    index("daraz_sync_published_idx").on(table.isPublishedOnWebsite),
    index("daraz_sync_web_product_idx").on(table.websiteProductId),
  ]
)

/**
 * 2. Daraz Sync Logs
 * Audit log of every import, price recalculation, stock sync, and webhook event.
 */
export const darazSyncLogs = pgTable(
  "daraz_sync_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    syncType: varchar("sync_type", { length: 50 }).notNull(), // FULL_IMPORT, DELTA_SYNC, MANUAL_SINGLE, STOCK_PULL, PRICE_UPDATE, WEBHOOK
    darazItemId: varchar("daraz_item_id", { length: 100 }),
    sellerSku: varchar("seller_sku", { length: 255 }),
    previousValues: jsonb("previous_values"),
    updatedValues: jsonb("updated_values"),
    status: varchar("status", { length: 20 }).notNull(), // SUCCESS, FAILED, WARNING
    details: text("details"),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("daraz_sync_log_sku_idx").on(table.sellerSku),
    index("daraz_sync_log_item_idx").on(table.darazItemId),
    index("daraz_sync_log_status_idx").on(table.status),
    index("daraz_sync_log_created_idx").on(table.createdAt),
  ]
)

/**
 * 3. Daraz Stock Reservations
 * Concurrency protection table for active checkout sessions to prevent overselling.
 */
export const darazStockReservations = pgTable(
  "daraz_stock_reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: varchar("order_id", { length: 100 }),
    variantId: uuid("variant_id").references(() => variants.id, { onDelete: "cascade" }),
    sellerSku: varchar("seller_sku", { length: 255 }).notNull(),
    reservedQuantity: integer("reserved_quantity").default(1).notNull(),
    status: varchar("status", { length: 50 }).default("HELD").notNull(), // HELD, CONFIRMED, RELEASED, DEDUCTED_ON_DARAZ
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("daraz_stock_res_sku_idx").on(table.sellerSku),
    index("daraz_stock_res_status_idx").on(table.status),
    index("daraz_stock_res_expires_idx").on(table.expiresAt),
  ]
)
