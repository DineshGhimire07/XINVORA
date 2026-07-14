"use server"

import { revalidatePath } from "next/cache"
import { AdminOrdersService } from "@/services/admin/orders.service"
import { SessionService } from "@/services/session.service"
import type { ActionResult } from "@/types/actions"

export async function markInvoiceAsPrintedAction(orderId: string): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAdmin()
    await AdminOrdersService.markInvoiceAsPrinted(orderId, session.id)
    revalidatePath("/admin/orders/print")
    return { success: true, data: null }
  } catch (error: any) {
    console.error("[markInvoiceAsPrintedAction Error]:", error)
    return {
      success: false,
      error: {
        code: "PRINT_INVOICE_ERROR",
        message: error.message || "Failed to mark invoice as printed.",
      },
    }
  }
}

export async function bulkMarkInvoicesAsPrintedAction(orderIds: string[]): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAdmin()
    for (const orderId of orderIds) {
      await AdminOrdersService.markInvoiceAsPrinted(orderId, session.id)
    }
    revalidatePath("/admin/orders/print")
    return { success: true, data: null }
  } catch (error: any) {
    console.error("[bulkMarkInvoicesAsPrintedAction Error]:", error)
    return {
      success: false,
      error: {
        code: "BULK_PRINT_INVOICE_ERROR",
        message: error.message || "Failed to bulk mark invoices as printed.",
      },
    }
  }
}

export async function updateInvoiceNotesAction(orderId: string, notes: string): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAdmin()
    await AdminOrdersService.updateInvoiceNotes(orderId, notes, session.id)
    revalidatePath("/admin/orders/print")
    return { success: true, data: null }
  } catch (error: any) {
    console.error("[updateInvoiceNotesAction Error]:", error)
    return {
      success: false,
      error: {
        code: "UPDATE_NOTES_ERROR",
        message: error.message || "Failed to update invoice notes.",
      },
    }
  }
}
