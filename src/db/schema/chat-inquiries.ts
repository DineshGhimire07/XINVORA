import { pgTable, text, timestamp, varchar, pgEnum, uuid } from "drizzle-orm/pg-core"
import { users } from "./users"
import { products } from "./products"

export const chatStatusEnum = pgEnum("chat_status", ["NEW", "READ", "REPLIED"])
export const chatSenderEnum = pgEnum("chat_sender", ["CUSTOMER", "ADMIN"])

export const chatInquiries = pgTable("chat_inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  // anonymous session tracking
  sessionId: varchar("session_id", { length: 255 }),
  // optional logged-in user
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  // optional product context
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: varchar("product_name", { length: 500 }),
  productUrl: text("product_url"),
  // customer info (optional for anonymous)
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  // message summary / initial message
  message: text("message").notNull(),
  // admin status
  status: chatStatusEnum("status").default("NEW").notNull(),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  inquiryId: uuid("inquiry_id")
    .references(() => chatInquiries.id, { onDelete: "cascade" })
    .notNull(),
  sender: chatSenderEnum("sender").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type ChatInquiry = typeof chatInquiries.$inferSelect
export type NewChatInquiry = typeof chatInquiries.$inferInsert
export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
