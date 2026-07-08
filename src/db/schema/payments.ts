import { pgTable, uuid, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core"
import { orders } from "./orders"
import { paymentStatusEnum, paymentProviderEnum, currencyEnum } from "./enums"

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  provider: paymentProviderEnum("provider").notNull(),
  providerPaymentId: varchar("provider_payment_id", { length: 255 }),
  status: paymentStatusEnum("status").notNull(),
  amount: integer("amount").notNull(), // stored in cents
  currency: currencyEnum("currency").notNull(),
  failureReason: varchar("failure_reason", { length: 1000 }),
  metadata: jsonb("metadata").default({}).notNull(),
  sessionExpiresAt: timestamp("session_expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
})
