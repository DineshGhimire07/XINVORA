import { eq, and } from "drizzle-orm"
import { db } from "../client"
import { payments } from "../schema/payments"

export class PaymentRepository {
  static async createPayment(tx: any, data: any) {
    const client = tx || db
    const [payment] = await client
      .insert(payments)
      .values(data)
      .returning()
    return payment
  }

  static async updatePaymentStatus(
    tx: any, 
    paymentId: string, 
    status: any, 
    extraData: { completedAt?: Date; failureReason?: string; metadata?: Record<string, any>; providerPaymentId?: string } = {}
  ) {
    const client = tx || db
    const updateValues: Record<string, any> = {
      status,
      updatedAt: new Date(),
    }
    if (extraData.completedAt !== undefined) {
      updateValues.completedAt = extraData.completedAt
    }
    if (extraData.failureReason !== undefined) {
      updateValues.failureReason = extraData.failureReason
    }
    if (extraData.metadata !== undefined) {
      updateValues.metadata = extraData.metadata
    }
    if (extraData.providerPaymentId !== undefined) {
      updateValues.providerPaymentId = extraData.providerPaymentId
    }

    const [payment] = await client
      .update(payments)
      .set(updateValues)
      .where(eq(payments.id, paymentId))
      .returning()
    return payment
  }

  static async findPayment(tx: any, id: string) {
    const client = tx || db
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isUuid) {
      const result = await client
        .select()
        .from(payments)
        .where(eq(payments.id, id))
        .limit(1)
      return result[0] ?? null
    } else {
      const result = await client
        .select()
        .from(payments)
        .where(eq(payments.providerPaymentId, id))
        .limit(1)
      return result[0] ?? null
    }
  }

  static async findPaymentByProviderId(tx: any, provider: any, providerPaymentId: string) {
    const client = tx || db
    const result = await client
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.provider, provider),
          eq(payments.providerPaymentId, providerPaymentId)
        )
      )
      .limit(1)
    return result[0] ?? null
  }

  static async findPaymentsByOrder(tx: any, orderId: string) {
    const client = tx || db
    return await client
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
  }
}
