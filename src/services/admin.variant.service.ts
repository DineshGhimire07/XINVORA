import "server-only"
import { db } from "@/db/client"
import { insertVariant, updateVariant, deleteVariant } from "@/db/mutations/variants"
import { insertInventory } from "@/db/mutations/inventory"
import { AdminAuditService } from "./admin.audit.service"

export class AdminVariantService {
  static async createVariant(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const variant = await insertVariant(data, tx)

      // Auto-create inventory record for this variant
      await insertInventory({ variantId: variant.id, quantity: 0, reserved: 0 }, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "VARIANT",
        entityId: variant.id,
        newValue: variant,
      }, tx)

      return variant
    })
  }

  static async updateVariant(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const variant = await updateVariant(id, data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "VARIANT",
        entityId: id,
        newValue: variant,
      }, tx)

      return variant
    })
  }
}
