import "server-only"
import { db } from "@/db/client"
import { insertCategory, updateCategory, softDeleteCategory, restoreCategory } from "@/db/mutations/categories"
import { AdminAuditService } from "./admin.audit.service"

export class AdminCategoryService {
  static async createCategory(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const category = await insertCategory(data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "CATEGORY",
        entityId: category.id,
        newValue: category,
      }, tx)

      return category
    })
  }

  static async updateCategory(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const category = await updateCategory(id, data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "CATEGORY",
        entityId: id,
        newValue: category,
      }, tx)

      return category
    })
  }

  static async deleteCategory(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const category = await softDeleteCategory(id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "CATEGORY",
        entityId: id,
      }, tx)

      return category
    })
  }
}
