import "server-only"
import { eq, and } from "drizzle-orm"
import { journalPosts, journalCategories, journalTags, journalPostTags, journalRevisions, journalViews } from "../schema/journal"

// --- Journal Posts ---
export async function insertJournalPost(data: Partial<typeof journalPosts.$inferInsert>, tx: any) {
  const result = await tx.insert(journalPosts).values(data).returning()
  return result[0]
}

export async function updateJournalPost(id: string, data: Partial<typeof journalPosts.$inferInsert>, tx: any) {
  const result = await tx
    .update(journalPosts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(journalPosts.id, id))
    .returning()
  return result[0]
}

export async function softDeleteJournalPost(id: string, tx: any) {
  const result = await tx
    .update(journalPosts)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(journalPosts.id, id))
    .returning()
  return result[0]
}

export async function restoreJournalPost(id: string, tx: any) {
  const result = await tx
    .update(journalPosts)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(journalPosts.id, id))
    .returning()
  return result[0]
}

export async function deleteJournalPostPermanently(id: string, tx: any) {
  const result = await tx
    .delete(journalPosts)
    .where(eq(journalPosts.id, id))
    .returning()
  return result[0]
}

// --- Categories ---
export async function insertJournalCategory(data: Partial<typeof journalCategories.$inferInsert>, tx: any) {
  const result = await tx.insert(journalCategories).values(data).returning()
  return result[0]
}

export async function updateJournalCategory(id: string, data: Partial<typeof journalCategories.$inferInsert>, tx: any) {
  const result = await tx
    .update(journalCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(journalCategories.id, id))
    .returning()
  return result[0]
}

// --- Tags ---
export async function insertJournalTag(data: Partial<typeof journalTags.$inferInsert>, tx: any) {
  const result = await tx.insert(journalTags).values(data).returning()
  return result[0]
}

export async function insertJournalPostTag(data: typeof journalPostTags.$inferInsert, tx: any) {
  const result = await tx.insert(journalPostTags).values(data).returning()
  return result[0]
}

export async function deleteJournalPostTags(postId: string, tx: any) {
  return await tx.delete(journalPostTags).where(eq(journalPostTags.postId, postId))
}

// --- Revisions ---
export async function insertJournalRevision(data: typeof journalRevisions.$inferInsert, tx: any) {
  const result = await tx.insert(journalRevisions).values(data).returning()
  return result[0]
}

// --- Views ---
export async function insertJournalView(data: typeof journalViews.$inferInsert, tx: any) {
  const result = await tx.insert(journalViews).values(data).returning()
  return result[0]
}
