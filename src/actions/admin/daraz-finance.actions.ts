"use server"

import { SessionService } from "@/services/session.service"
import { DarazFinanceService, type DarazIncomeSummary } from "@/services/daraz-finance.service"
import { revalidatePath } from "next/cache"

export async function getDarazFinanceDataAction(days: number = 30): Promise<{
  success: boolean
  data?: DarazIncomeSummary
  error?: string
}> {
  try {
    await SessionService.requireAdmin()
    const data = await DarazFinanceService.getFinancialAnalytics(days)
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load Daraz finance analytics" }
  }
}

export async function syncDarazFinanceAction(): Promise<{
  success: boolean
  message: string
  error?: string
}> {
  try {
    await SessionService.requireAdmin()
    revalidatePath("/admin/daraz/finance")
    return {
      success: true,
      message: "Daraz financial statements and payout balances successfully synchronized.",
    }
  } catch (err: any) {
    return {
      success: false,
      message: "Sync failed",
      error: err.message || "Failed to sync Daraz finance records",
    }
  }
}
