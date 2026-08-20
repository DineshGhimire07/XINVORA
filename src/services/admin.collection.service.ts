import "server-only"
import { db } from "@/db/client"
import { insertCollection, updateCollection, softDeleteCollection, restoreCollection } from "@/db/mutations/collections"
import { productCollections } from "@/db/schema/product-collections"
import { eq } from "drizzle-orm"
import { AdminAuditService } from "./admin.audit.service"

export class AdminCollectionService {
  static async createCollection(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const { productIds, ...collectionData } = data
      const collection = await insertCollection(collectionData, tx)

      if (productIds && productIds.length > 0) {
        await tx.insert(productCollections).values(
          productIds.map((pId: string) => ({
            productId: pId,
            collectionId: collection.id,
          }))
        )
      }

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "COLLECTION",
        entityId: collection.id,
        newValue: { ...collection, productIds },
      }, tx)

      return collection
    })
  }

  static async updateCollection(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const { productIds, ...collectionData } = data
      const collection = await updateCollection(id, collectionData, tx)

      await tx.delete(productCollections).where(eq(productCollections.collectionId, id))
      if (productIds && productIds.length > 0) {
        await tx.insert(productCollections).values(
          productIds.map((pId: string) => ({
            productId: pId,
            collectionId: id,
          }))
        )
      }

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "COLLECTION",
        entityId: id,
        newValue: { ...collection, productIds },
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

  static async hardDeleteCollection(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const { collections } = await import("@/db/schema/collections")
      await tx.delete(productCollections).where(eq(productCollections.collectionId, id))
      const [deleted] = await tx.delete(collections).where(eq(collections.id, id)).returning()

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "COLLECTION",
        entityId: id,
        reason: `Permanently deleted collection: ${deleted?.name || id}`
      }, tx)

      return deleted
    })
  }
}
