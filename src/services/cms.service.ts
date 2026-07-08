import "server-only"
import { db } from "@/db/client"
import { insertPage, updatePage, softDeletePage, insertSection, updateSection, deleteSection, insertBlock, updateBlock, deleteBlock, upsertHomepageSettings } from "@/db/mutations/cms"
import { AdminAuditService } from "./admin.audit.service"

export class CMSService {
  // --- Pages ---
  static async createPage(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const page = await insertPage(data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "CMS_PAGE",
        entityId: page.id,
        newValue: page,
      }, tx)
      return page
    })
  }

  static async updatePage(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const page = await updatePage(id, data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "CMS_PAGE",
        entityId: id,
        newValue: page,
      }, tx)
      return page
    })
  }

  static async deletePage(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const page = await softDeletePage(id, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "CMS_PAGE",
        entityId: id,
      }, tx)
      return page
    })
  }

  // --- Homepage Settings ---
  static async updateHomepageSettings(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const settings = await upsertHomepageSettings(data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "HOMEPAGE_SETTINGS",
        entityId: settings.id,
        newValue: settings,
      }, tx)
      return settings
    })
  }

  // --- Sections & Blocks (Simplification for now) ---
  static async addSection(pageId: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const section = await insertSection({ ...data, pageId }, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "CMS_SECTION",
        entityId: section.id,
        newValue: section,
      }, tx)
      return section
    })
  }

  static async addBlock(sectionId: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const block = await insertBlock({ ...data, sectionId }, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "CMS_BLOCK",
        entityId: block.id,
        newValue: block,
      }, tx)
      return block
    })
  }
}
