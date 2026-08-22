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

  static async getCollectionTemplate(collectionId: string) {
    const { collectionImageRoleTemplates, collectionImageRoles } = await import("@/db/schema/collection-image-templates")
    const { asc } = await import("drizzle-orm")
    return await db.query.collectionImageRoleTemplates.findFirst({
      where: eq(collectionImageRoleTemplates.collectionId, collectionId),
      with: {
        roles: {
          orderBy: [asc(collectionImageRoles.position)],
        },
      },
    })
  }

  static async saveCollectionTemplate(
    collectionId: string,
    data: {
      name: string
      description?: string
      isActive?: boolean
      roles: { position: number; role: string; label: string }[]
    },
    adminUserId: string
  ) {
    const { collectionImageRoleTemplates, collectionImageRoles, SUPPORTED_IMAGE_ROLES } = await import("@/db/schema/collection-image-templates")
    const { ProductImageMetadataService } = await import("@/domains/seo/services/product-image-metadata.service")
    const { asc } = await import("drizzle-orm")

    return await db.transaction(async (tx) => {
      // Validate roles against supported registry
      const supportedSet = new Set(SUPPORTED_IMAGE_ROLES.map((r) => r.role))
      for (const r of data.roles) {
        if (!supportedSet.has(r.role as any)) {
          throw new Error(`Unsupported role identifier: ${r.role}`)
        }
        if (typeof r.position !== "number" || r.position < 1) {
          throw new Error(`Position must be a positive integer: ${r.position}`)
        }
      }

      // Check for existing template
      let template = await tx.query.collectionImageRoleTemplates.findFirst({
        where: eq(collectionImageRoleTemplates.collectionId, collectionId),
      })

      if (!template) {
        const [newTpl] = await tx
          .insert(collectionImageRoleTemplates)
          .values({
            collectionId,
            name: data.name.trim(),
            description: data.description?.trim() || null,
            isActive: data.isActive ?? true,
          })
          .returning()
        template = newTpl
      } else {
        const [updatedTpl] = await tx
          .update(collectionImageRoleTemplates)
          .set({
            name: data.name.trim(),
            description: data.description?.trim() || null,
            isActive: data.isActive ?? true,
            updatedAt: new Date(),
          })
          .where(eq(collectionImageRoleTemplates.id, template.id))
          .returning()
        template = updatedTpl
      }

      // Replace roles
      await tx
        .delete(collectionImageRoles)
        .where(eq(collectionImageRoles.templateId, template.id))

      if (data.roles && data.roles.length > 0) {
        await tx.insert(collectionImageRoles).values(
          data.roles.map((r) => {
            const roleLabel = ProductImageMetadataService.getRoleLabel(r.role) || r.label || r.role
            return {
              templateId: template.id,
              position: r.position,
              role: r.role,
              label: roleLabel,
            }
          })
        )
      }

      // Synchronize all products using this template inside the transaction
      const { updatedCount } = await ProductImageMetadataService.syncProductsForTemplate(template.id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "COLLECTION",
        entityId: template.id,
        newValue: { template, roles: data.roles, updatedProductsCount: updatedCount },
      }, tx)

      // Return refreshed template with roles
      return await tx.query.collectionImageRoleTemplates.findFirst({
        where: eq(collectionImageRoleTemplates.id, template.id),
        with: {
          roles: {
            orderBy: [asc(collectionImageRoles.position)],
          },
        },
      })
    })
  }
}
