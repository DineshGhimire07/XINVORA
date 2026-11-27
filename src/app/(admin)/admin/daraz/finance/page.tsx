import { SessionService } from "@/services/session.service"
import { DarazFinanceService } from "@/services/daraz-finance.service"
import { DarazFinanceClient } from "./DarazFinanceClient"

export const metadata = {
  title: "Daraz Financial Intelligence | XINVORA Admin",
  description: "Settlement ledger, deduction analytics, and bank payout reconciliation from Daraz Open Platform.",
}

export const dynamic = "force-dynamic"

export default async function DarazFinancePage() {
  await SessionService.requireAdmin()

  const financialData = await DarazFinanceService.getFinancialAnalytics(30)

  return (
    <div className="space-y-6">
      <DarazFinanceClient initialData={financialData} />
    </div>
  )
}
