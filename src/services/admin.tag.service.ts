import "server-only"
import { db } from "@/db/client"
import { insertTag, updateTag, deleteTag } from "@/db/mutations/tags"
import { AdminAuditService } from "./admin.audit.service"

export class AdminTagService {
  static async createTag(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const tag = await insertTag(data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "TAG",
        entityId: tag.id,
        newValue: tag,
      }, tx)

      return tag
    })
  }

  static async updateTag(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const tag = await updateTag(id, data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "TAG",
        entityId: id,
        newValue: tag,
      }, tx)

      return tag
    })
  }

  static async deleteTag(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const tag = await deleteTag(id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "TAG",
        entityId: id,
      }, tx)

      return tag
    })
  }
}
