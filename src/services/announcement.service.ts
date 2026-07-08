import "server-only"
import { db } from "@/db/client"
import { insertAnnouncement, updateAnnouncement, softDeleteAnnouncement } from "@/db/mutations/announcements"
import { AdminAuditService } from "./admin.audit.service"

export class AnnouncementService {
  static async createAnnouncement(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const announcement = await insertAnnouncement(data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "ANNOUNCEMENT",
        entityId: announcement.id,
        newValue: announcement,
      }, tx)
      return announcement
    })
  }

  static async updateAnnouncement(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const announcement = await updateAnnouncement(id, data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "ANNOUNCEMENT",
        entityId: id,
        newValue: announcement,
      }, tx)
      return announcement
    })
  }

  static async deleteAnnouncement(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const announcement = await softDeleteAnnouncement(id, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "ANNOUNCEMENT",
        entityId: id,
      }, tx)
      return announcement
    })
  }
}
