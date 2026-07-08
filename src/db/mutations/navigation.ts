import { eq } from "drizzle-orm"
import { db } from "../client"
import { navigationMenus, menuItems } from "../schema/navigation"

// --- Menus ---

export async function insertMenu(data: any, tx: any = db) {
  const [menu] = await tx.insert(navigationMenus).values(data).returning()
  return menu
}

export async function updateMenu(id: string, data: any, tx: any = db) {
  const [menu] = await tx
    .update(navigationMenus)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(navigationMenus.id, id))
    .returning()
  return menu
}

export async function softDeleteMenu(id: string, tx: any = db) {
  const [menu] = await tx
    .update(navigationMenus)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(navigationMenus.id, id))
    .returning()
  return menu
}

// --- Menu Items ---

export async function insertMenuItem(data: any, tx: any = db) {
  const [item] = await tx.insert(menuItems).values(data).returning()
  return item
}

export async function updateMenuItem(id: string, data: any, tx: any = db) {
  const [item] = await tx
    .update(menuItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(menuItems.id, id))
    .returning()
  return item
}

export async function deleteMenuItem(id: string, tx: any = db) {
  const [item] = await tx
    .delete(menuItems)
    .where(eq(menuItems.id, id))
    .returning()
  return item
}
