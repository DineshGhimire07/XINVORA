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

  static async bulkCreateCollections(
    items: BulkCollectionInput[],
    adminUserId: string
  ): Promise<BulkCollectionImportResult> {
    const { collections } = await import("@/db/schema/collections")
    const { slugify } = await import("@/lib/utils")

    const result: BulkCollectionImportResult = {
      total: items.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    }

    if (!items || items.length === 0) {
      return result
    }

    return await db.transaction(async (tx) => {
      // 1. Fetch all existing collections to map slugs and parent IDs
      const existingCollections = await tx
        .select({ id: collections.id, slug: collections.slug, deletedAt: collections.deletedAt })
        .from(collections)

      const slugToIdMap = new Map<string, string>()
      const existingSlugSet = new Map<string, { id: string; isDeleted: boolean }>()

      for (const col of existingCollections) {
        slugToIdMap.set(col.slug, col.id)
        existingSlugSet.set(col.slug, { id: col.id, isDeleted: col.deletedAt !== null })
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const rowNumber = i + 1

        try {
          const rawName = item.name ? String(item.name).trim() : ""
          if (!rawName) {
            result.failed++
            result.errors.push({
              row: rowNumber,
              name: rawName || `Row #${rowNumber}`,
              error: "Collection Name is required.",
            })
            continue
          }

          let finalSlug = item.slug ? slugify(String(item.slug)) : slugify(rawName)
          if (!finalSlug) {
            finalSlug = `collection-${Date.now()}-${i}`
          }

          const description = item.description ? String(item.description).trim() : null
          const imageUrl = item.imageUrl ? String(item.imageUrl).trim() : null
          const imageMobileUrl = item.imageMobileUrl ? String(item.imageMobileUrl).trim() : null
          const bannerUrl = item.bannerUrl ? String(item.bannerUrl).trim() : null
          const bannerMobileUrl = item.bannerMobileUrl ? String(item.bannerMobileUrl).trim() : null

          let sortOrder = 0
          if (item.sortOrder !== undefined && item.sortOrder !== null && item.sortOrder !== "") {
            const parsedSort = parseInt(String(item.sortOrder), 10)
            if (!isNaN(parsedSort)) sortOrder = parsedSort
          }

          let isActive = true
          if (item.isActive !== undefined && item.isActive !== null && item.isActive !== "") {
            const strVal = String(item.isActive).toLowerCase().trim()
            if (strVal === "false" || strVal === "0" || strVal === "no" || strVal === "inactive") {
              isActive = false
            }
          }

          const seoTitle = item.seoTitle ? String(item.seoTitle).trim() : null
          const seoDescription = item.seoDescription ? String(item.seoDescription).trim() : null

          let parentId: string | null = null
          if (item.parentSlug) {
            const cleanParentSlug = slugify(String(item.parentSlug))
            if (slugToIdMap.has(cleanParentSlug)) {
              parentId = slugToIdMap.get(cleanParentSlug) || null
            }
          }

          const existing = existingSlugSet.get(finalSlug)

          if (existing) {
            // Update existing collection
            const [updated] = await tx
              .update(collections)
              .set({
                name: rawName,
                description: description || undefined,
                imageUrl: imageUrl || undefined,
                imageMobileUrl: imageMobileUrl || undefined,
                bannerUrl: bannerUrl || undefined,
                bannerMobileUrl: bannerMobileUrl || undefined,
                sortOrder,
                isActive,
                seoTitle: seoTitle || undefined,
                seoDescription: seoDescription || undefined,
                parentId: parentId || undefined,
                deletedAt: null, // restore if soft-deleted
                updatedAt: new Date(),
              })
              .where(eq(collections.id, existing.id))
              .returning()

            slugToIdMap.set(finalSlug, updated.id)
            result.updated++
          } else {
            // Insert new collection
            const [inserted] = await tx
              .insert(collections)
              .values({
                name: rawName,
                slug: finalSlug,
                description,
                imageUrl,
                imageMobileUrl,
                bannerUrl,
                bannerMobileUrl,
                sortOrder,
                isActive,
                seoTitle,
                seoDescription,
                parentId,
                deletedAt: null,
              })
              .returning()

            slugToIdMap.set(finalSlug, inserted.id)
            existingSlugSet.set(finalSlug, { id: inserted.id, isDeleted: false })
            result.created++
          }
        } catch (err: any) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            name: item.name || `Row #${rowNumber}`,
            error: err.message || "Failed to process collection row.",
          })
        }
      }

      await AdminAuditService.logAction(
        {
          userId: adminUserId,
          action: "CREATE",
          entityType: "COLLECTION",
          entityId: "bulk-import",
          newValue: {
            total: result.total,
            created: result.created,
            updated: result.updated,
            failed: result.failed,
          },
        },
        tx
      )

      return result
    })
  }
}

export interface BulkCollectionInput {
  name: string
  slug?: string | null
  description?: string | null
  imageUrl?: string | null
  imageMobileUrl?: string | null
  bannerUrl?: string | null
  bannerMobileUrl?: string | null
  sortOrder?: number | string | null
  isActive?: boolean | string | null
  seoTitle?: string | null
  seoDescription?: string | null
  parentSlug?: string | null
}

export interface BulkCollectionImportResult {
  total: number
  created: number
  updated: number
  failed: number
  errors: { row: number; name: string; error: string }[]
}
