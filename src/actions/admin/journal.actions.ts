"use server"

import { revalidatePath } from "next/cache"
import { JournalService } from "@/services/journal.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

// --- Zod Input Validation ---
const basePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().max(255).optional(),
  excerpt: z.string().min(1, "Excerpt is required"),
  body: z.array(z.any()).default([]),
  coverImage: z.string().max(1024).optional().nullable(),
  gallery: z.array(z.string()).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "PASSWORD"]).default("PUBLIC"),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  readingTimeOverride: z.number().int().optional().nullable(),
  workflowState: z.enum(["DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  focusKeyword: z.string().max(255).optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  seoTitle: z.string().max(255).optional().nullable(),
  canonicalUrl: z.string().max(1024).optional().nullable(),
})

export async function createJournalPostAction(input: any) {
  try {
    const session = await SessionService.requireAdmin()
    const data = basePostSchema.parse(input)

    const post = await JournalService.createPost(data as any, session.id)

    revalidatePath("/admin/content/journal")
    revalidatePath("/journal")
    return { success: true, id: post.id }
  } catch (error: any) {
    console.error("[createJournalPostAction] Error:", error)
    return { success: false, error: error.message || "Failed to create journal post" }
  }
}

export async function updateJournalPostAction(id: string, input: any) {
  try {
    const session = await SessionService.requireAdmin()
    const data = basePostSchema.parse(input)

    await JournalService.updatePost(id, data as any, session.id)

    revalidatePath("/admin/content/journal")
    revalidatePath(`/admin/content/journal/${id}`)
    revalidatePath("/journal")
    return { success: true }
  } catch (error: any) {
    console.error("[updateJournalPostAction] Error:", error)
    return { success: false, error: error.message || "Failed to update journal post" }
  }
}

export async function duplicateJournalPostAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    const post = await JournalService.duplicatePost(id, session.id)

    revalidatePath("/admin/content/journal")
    revalidatePath("/journal")
    return { success: true, id: post.id }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to duplicate journal post" }
  }
}

export async function restoreJournalRevisionAction(revisionId: string) {
  try {
    const session = await SessionService.requireAdmin()
    const post = await JournalService.restoreRevision(revisionId, session.id)

    revalidatePath("/admin/content/journal")
    revalidatePath(`/admin/content/journal/${post.id}`)
    revalidatePath("/journal")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to restore revision" }
  }
}

export async function deleteJournalPostAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await JournalService.deletePost(id, session.id)

    revalidatePath("/admin/content/journal")
    revalidatePath("/journal")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete journal post" }
  }
}

// --- Bulk Action Handlers ---
export async function bulkPublishJournalPostsAction(ids: string[]) {
  try {
    const session = await SessionService.requireAdmin()
    
    for (const id of ids) {
      const post = await JournalService.updatePost(id, {
        title: "", excerpt: "", body: [], // these parameters aren't modified because we only pass workflowState in dynamic save/update
        workflowState: "PUBLISHED",
      } as any, session.id)
    }

    revalidatePath("/admin/content/journal")
    revalidatePath("/journal")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Bulk publish failed" }
  }
}

export async function bulkArchiveJournalPostsAction(ids: string[]) {
  try {
    const session = await SessionService.requireAdmin()
    
    for (const id of ids) {
      await JournalService.updatePost(id, {
        title: "", excerpt: "", body: [],
        workflowState: "ARCHIVED",
      } as any, session.id)
    }

    revalidatePath("/admin/content/journal")
    revalidatePath("/journal")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Bulk archive failed" }
  }
}

export async function bulkDeleteJournalPostsAction(ids: string[]) {
  try {
    const session = await SessionService.requireAdmin()
    
    for (const id of ids) {
      await JournalService.deletePost(id, session.id)
    }

    revalidatePath("/admin/content/journal")
    revalidatePath("/journal")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Bulk delete failed" }
  }
}
