"use server"

import { SessionService } from "@/services/session.service"
import { findAdminOrderDetailsById } from "@/db/queries/orders"

export async function getOrderDetailsAction(orderId: string) {
  await SessionService.requireAdmin()
  return await findAdminOrderDetailsById(orderId)
}
