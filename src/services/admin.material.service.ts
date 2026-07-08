import "server-only"
import { db } from "@/db/client"
import { insertMaterial, updateMaterial, softDeleteMaterial, restoreMaterial } from "@/db/mutations/materials"
import { AdminAuditService } from "./admin.audit.service"

export class AdminMaterialService {
  static async createMaterial(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const material = await insertMaterial(data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "MATERIAL",
        entityId: material.id,
        newValue: material,
      }, tx)

      return material
    })
  }

  static async updateMaterial(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const material = await updateMaterial(id, data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "MATERIAL",
        entityId: id,
        newValue: material,
      }, tx)

      return material
    })
  }

  static async deleteMaterial(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const material = await softDeleteMaterial(id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "MATERIAL",
        entityId: id,
      }, tx)

      return material
    })
  }
}
