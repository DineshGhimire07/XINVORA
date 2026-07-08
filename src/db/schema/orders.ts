import { pgTable, uuid, varchar, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core"
import { users } from "./users"
import { orderStatusEnum, paymentStatusEnum, currencyEnum } from "./enums"

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  internalId: integer("internal_id").generatedAlwaysAsIdentity().unique(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(), // e.g. XINV-2026-0042
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique(), // e.g. INV-K2P9RM7A
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: orderStatusEnum("status").default("PENDING").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("PENDING").notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("COD"),
  
  // Snapshots (JSONB)
  shippingAddress: jsonb("shipping_address").notNull(),
  billingAddress: jsonb("billing_address").notNull(),
  
  // Totals
  subtotal: integer("subtotal").notNull(),
  shippingMethod: varchar("shipping_method", { length: 100 }),
  shippingCost: integer("shipping_cost").notNull(),
  estimatedDelivery: timestamp("estimated_delivery"),
  taxRate: integer("tax_rate").default(0).notNull(), // in basis points, e.g., 1300 = 13.00%
  taxAmount: integer("tax_amount").notNull(),
  discountAmount: integer("discount_amount").default(0).notNull(),
  couponId: uuid("coupon_id"), // soft relation
  total: integer("total").notNull(),
  currency: currencyEnum("currency").notNull(),
  
  // Payment info
  paymentProvider: varchar("payment_provider", { length: 100 }),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  paymentProofUrl: varchar("payment_proof_url", { length: 1000 }),
  notes: varchar("notes", { length: 1000 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("orders_user_id_idx").on(table.userId),
  index("orders_coupon_id_idx").on(table.couponId),
  index("orders_status_idx").on(table.status),
  index("orders_payment_status_idx").on(table.paymentStatus),
  index("orders_created_at_idx").on(table.createdAt),
])
