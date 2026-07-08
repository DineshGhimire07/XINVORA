import "server-only"
import { db } from "@/db/client"
import { AdminAuditService } from "./admin.audit.service"
import { InventoryService } from "./inventory.service"

export class AdminInventoryService {
  static async updateStock(id: string, delta: number, adminUserId: string, reason?: string) {
    return await db.transaction(async (tx) => {
      const { updatedInv, nextQuantity } = await InventoryService.adjustStock(id, delta, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "INVENTORY",
        entityId: id,
        newValue: { quantity: nextQuantity, delta },
        reason: reason || "Manual stock adjustment",
      }, tx)

      return updatedInv
    })
  }
}
