import "server-only"
import { db } from "@/db/client"
import { insertMedia, updateMedia, softDeleteMedia } from "@/db/mutations/media"
import { AdminAuditService } from "./admin.audit.service"

export class MediaService {
  static async createMedia(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const media = await insertMedia(data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "MEDIA",
        entityId: media.id,
        newValue: media,
      }, tx)
      return media
    })
  }

  static async updateMedia(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const media = await updateMedia(id, data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "MEDIA",
        entityId: id,
        newValue: media,
      }, tx)
      return media
    })
  }

  static async deleteMedia(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const media = await softDeleteMedia(id, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "MEDIA",
        entityId: id,
      }, tx)
      return media
    })
  }
}
