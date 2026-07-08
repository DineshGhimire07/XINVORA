import "server-only"
import { db } from "@/db/client"
import { insertMenu, updateMenu, softDeleteMenu, insertMenuItem, updateMenuItem, deleteMenuItem } from "@/db/mutations/navigation"
import { AdminAuditService } from "./admin.audit.service"

export class NavigationService {
  static async createMenu(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const menu = await insertMenu(data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "NAVIGATION_MENU",
        entityId: menu.id,
        newValue: menu,
      }, tx)
      return menu
    })
  }

  static async updateMenu(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const menu = await updateMenu(id, data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "NAVIGATION_MENU",
        entityId: id,
        newValue: menu,
      }, tx)
      return menu
    })
  }

  static async deleteMenu(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const menu = await softDeleteMenu(id, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "NAVIGATION_MENU",
        entityId: id,
      }, tx)
      return menu
    })
  }

  static async addMenuItem(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const item = await insertMenuItem(data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "MENU_ITEM",
        entityId: item.id,
        newValue: item,
      }, tx)
      return item
    })
  }

  static async updateMenuItem(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const item = await updateMenuItem(id, data, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "MENU_ITEM",
        entityId: id,
        newValue: item,
      }, tx)
      return item
    })
  }

  static async deleteMenuItem(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const item = await deleteMenuItem(id, tx)
      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "MENU_ITEM",
        entityId: id,
      }, tx)
      return item
    })
  }
}
