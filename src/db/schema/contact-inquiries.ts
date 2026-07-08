import { pgTable, text, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core"
import { randomUUID } from "crypto"

export const inquiryStatusEnum = pgEnum('inquiry_status', ['NEW', 'READ', 'RESPONDED'])

export const contactInquiries = pgTable("contact_inquiries", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: inquiryStatusEnum("status").default('NEW').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
