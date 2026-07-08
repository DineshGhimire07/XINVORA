"use server"

import { revalidatePath } from "next/cache"
import { AdminInventoryService } from "@/services/admin.inventory.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"
import { db } from "@/db/client"
import { inventory } from "@/db/schema"
import { eq } from "drizzle-orm"

const inventorySchema = z.object({
  inventoryId: z.string().uuid(),
  delta: z.number().or(z.string().transform(Number)),
  reason: z.string().optional(),
})

export async function updateInventoryAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      inventoryId: formData.get("inventoryId"),
      delta: formData.get("delta"),
      reason: formData.get("reason"),
    }

    const data = inventorySchema.parse(rawData)

    await AdminInventoryService.updateStock(
      data.inventoryId,
      data.delta,
      session.id,
      data.reason
    )

    revalidatePath("/admin/inventory")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update inventory" }
  }
}

export async function deleteInventoryAction(inventoryId: string) {
  try {
    await SessionService.requireAdmin()
    await db.delete(inventory).where(eq(inventory.id, inventoryId))
    revalidatePath("/admin/inventory")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete inventory" }
  }
}
