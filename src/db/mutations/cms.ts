import { eq } from "drizzle-orm"
import { db } from "../client"
import { cmsPages, cmsSections, cmsBlocks, homepageSettings } from "../schema/cms"

// --- Pages ---

export async function insertPage(data: any, tx: any = db) {
  const [page] = await tx.insert(cmsPages).values(data).returning()
  return page
}

export async function updatePage(id: string, data: any, tx: any = db) {
  const [page] = await tx
    .update(cmsPages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cmsPages.id, id))
    .returning()
  return page
}

export async function softDeletePage(id: string, tx: any = db) {
  const [page] = await tx
    .update(cmsPages)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(cmsPages.id, id))
    .returning()
  return page
}

// --- Sections ---

export async function insertSection(data: any, tx: any = db) {
  const [section] = await tx.insert(cmsSections).values(data).returning()
  return section
}

export async function updateSection(id: string, data: any, tx: any = db) {
  const [section] = await tx
    .update(cmsSections)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cmsSections.id, id))
    .returning()
  return section
}

export async function deleteSection(id: string, tx: any = db) {
  const [section] = await tx
    .delete(cmsSections)
    .where(eq(cmsSections.id, id))
    .returning()
  return section
}

// --- Blocks ---

export async function insertBlock(data: any, tx: any = db) {
  const [block] = await tx.insert(cmsBlocks).values(data).returning()
  return block
}

export async function updateBlock(id: string, data: any, tx: any = db) {
  const [block] = await tx
    .update(cmsBlocks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cmsBlocks.id, id))
    .returning()
  return block
}

export async function deleteBlock(id: string, tx: any = db) {
  const [block] = await tx
    .delete(cmsBlocks)
    .where(eq(cmsBlocks.id, id))
    .returning()
  return block
}

// --- Homepage Settings ---

export async function upsertHomepageSettings(data: any, tx: any = db) {
  // Try to find the singleton
  const existing = await tx.select().from(homepageSettings).limit(1)
  
  if (existing.length > 0) {
    const [settings] = await tx
      .update(homepageSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(homepageSettings.id, existing[0].id))
      .returning()
    return settings
  } else {
    const [settings] = await tx.insert(homepageSettings).values(data).returning()
    return settings
  }
}
