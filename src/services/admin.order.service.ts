import "server-only"
import { db } from "@/db/client"
import { updateOrder } from "@/db/mutations/orders"
import { AdminAuditService } from "./admin.audit.service"

export class AdminOrderService {
  static async updateOrderStatus(id: string, newStatus: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      // We would ideally fetch current order to validate the state transition
      // e.g., cannot go from CANCELLED to SHIPPED

      const order = await updateOrder(id, { status: newStatus as any }, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "ORDER",
        entityId: id,
        newValue: { status: newStatus },
      }, tx)

      return order
    })
  }

  static async addInternalNote(id: string, note: string, adminUserId: string) {
    // Note: Assuming orders table will be expanded with an internalNotes field, 
    // or a separate order_notes table is created later.
    // For now we log it in the audit trail.
    return await db.transaction(async (tx) => {
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "ORDER",
        entityId: id,
        reason: `Internal Note: ${note}`,
      }, tx)
      return true
    })
  }
}
