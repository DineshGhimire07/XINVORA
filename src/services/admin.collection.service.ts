import "server-only"
import { db } from "@/db/client"
import { insertCollection, updateCollection, softDeleteCollection, restoreCollection } from "@/db/mutations/collections"
import { AdminAuditService } from "./admin.audit.service"

export class AdminCollectionService {
  static async createCollection(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const collection = await insertCollection(data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "COLLECTION",
        entityId: collection.id,
        newValue: collection,
      }, tx)

      return collection
    })
  }

  static async updateCollection(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const collection = await updateCollection(id, data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "COLLECTION",
        entityId: id,
        newValue: collection,
      }, tx)

      return collection
    })
  }

  static async deleteCollection(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const collection = await softDeleteCollection(id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "COLLECTION",
        entityId: id,
      }, tx)

      return collection
    })
  }
}
