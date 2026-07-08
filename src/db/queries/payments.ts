import { eq, desc } from "drizzle-orm"
import { db } from "../client"
import { payments } from "../schema/payments"

export async function findPayment(id: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  
  if (isUuid) {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1)
    return result[0] ?? null
  } else {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.providerPaymentId, id))
      .limit(1)
    return result[0] ?? null
  }
}

export async function findPaymentsByOrder(orderId: string) {
  return await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(desc(payments.createdAt))
}

export async function findLatestPayment(orderId: string) {
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(desc(payments.createdAt))
    .limit(1)
  return result[0] ?? null
}
