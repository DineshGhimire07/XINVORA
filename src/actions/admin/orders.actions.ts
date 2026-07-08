"use server"

import { revalidatePath } from "next/cache"
import { AdminOrdersService } from "@/services/admin/orders.service"
import { SessionService } from "@/services/session.service"
import type { ActionResult } from "@/types/actions"
import { z } from "zod"

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "PENDING",
    "PENDING_PAYMENT", 
    "PAID", 
    "CONFIRMED",
    "PROCESSING", 
    "PACKED",
    "SHIPPED", 
    "OUT_FOR_DELIVERY",
    "DELIVERED", 
    "CANCELLED", 
    "REFUNDED"
  ]),
})

export async function updateOrderStatusAction(
  orderId: string, 
  status: string
): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAdmin()
    // Admin verification should happen here - assume session has role check or similar.
    // For XINVORA MVP we assume if they reach this action they are authenticated admin.
    
    const validated = updateStatusSchema.parse({ orderId, status })
    
    await AdminOrdersService.updateOrderStatus(validated.orderId, validated.status, session.id)

    revalidatePath("/admin/orders")
    
    return { success: true, data: { status: validated.status } }
  } catch (error: any) {
    console.error("[updateOrderStatusAction Error]:", error)
    return {
      success: false,
      error: {
        code: "UPDATE_STATUS_ERROR",
        message: error.message || "Failed to update order status.",
      },
    }
  }
}

export async function assignInvoiceNumberAction(orderId: string): Promise<ActionResult<{ invoiceNumber: string }>> {
  try {
    await SessionService.requireAdmin()
    const invoiceNumber = await AdminOrdersService.ensureInvoiceNumber(orderId)
    revalidatePath("/admin/orders")
    
    return { success: true, data: { invoiceNumber } }
  } catch (error: any) {
    console.error("[assignInvoiceNumberAction Error]:", error)
    return {
      success: false,
      error: {
        code: "ASSIGN_INVOICE_ERROR",
        message: error.message || "Failed to assign invoice number.",
      },
    }
  }
}

export async function bulkUpdateOrdersAction(
  orderIds: string[], 
  status: string
): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAdmin()
    
    for (const orderId of orderIds) {
      const validated = updateStatusSchema.parse({ orderId, status })
      await AdminOrdersService.updateOrderStatus(validated.orderId, validated.status, session.id)
    }

    revalidatePath("/admin/orders")
    
    return { success: true, data: null }
  } catch (error: any) {
    console.error("[bulkUpdateOrdersAction Error]:", error)
    return {
      success: false,
      error: {
        code: "BULK_UPDATE_ERROR",
        message: error.message || "Failed to bulk update orders.",
      },
    }
  }
}

export async function getOrderDetailsAction(orderId: string): Promise<ActionResult<any>> {
  try {
    await SessionService.requireAdmin()
    const order = await AdminOrdersService.getOrderDetails(orderId)
    if (!order) throw new Error("Order not found")
    
    return { success: true, data: order }
  } catch (error: any) {
    console.error("[getOrderDetailsAction Error]:", error)
    return {
      success: false,
      error: {
        code: "GET_ORDER_ERROR",
        message: error.message || "Failed to get order details.",
      },
    }
  }
}

export async function deleteOrderAction(orderId: string): Promise<ActionResult<any>> {
  try {
    await SessionService.requireAdmin()
    await AdminOrdersService.deleteOrder(orderId)
    revalidatePath("/admin/orders")
    return { success: true, data: null }
  } catch (error: any) {
    console.error("[deleteOrderAction Error]:", error)
    return {
      success: false,
      error: {
        code: "DELETE_ORDER_ERROR",
        message: error.message || "Failed to delete order.",
      },
    }
  }
}
