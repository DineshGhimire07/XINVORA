import "server-only"
import { db } from "@/db/client"
import { insertBrand, updateBrand, softDeleteBrand, restoreBrand } from "@/db/mutations/brands"
import { AdminAuditService } from "./admin.audit.service"

export class AdminBrandService {
  static async createBrand(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const brand = await insertBrand(data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "BRAND",
        entityId: brand.id,
        newValue: brand,
      }, tx)

      return brand
    })
  }

  static async updateBrand(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const brand = await updateBrand(id, data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "BRAND",
        entityId: id,
        newValue: brand,
      }, tx)

      return brand
    })
  }

  static async deleteBrand(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const brand = await softDeleteBrand(id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "BRAND",
        entityId: id,
      }, tx)

      return brand
    })
  }
}
