import { SessionService } from "@/services/session.service"
import { findAdminInvoicesPaginated, getInvoiceStats } from "@/db/queries/invoices"
import { PrintInvoicesClient } from "./PrintInvoicesClient"

export const metadata = {
  title: "Print Invoices | XINVORA Admin",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
    startDate?: string
    endDate?: string
  }>
}

export default async function AdminInvoicesPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const limit = 10
  const search = searchParams.search || ""
  const status = searchParams.status || "all"
  const startDate = searchParams.startDate || ""
  const endDate = searchParams.endDate || ""

  // Load paginated data
  const invoiceData = await findAdminInvoicesPaginated({
    page,
    limit,
    search,
    status,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  // Load stats counters
  const stats = await getInvoiceStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
            Print Invoices
          </h1>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Manage, verify, and print invoices for your customer orders.
          </p>
        </div>
      </div>

      <PrintInvoicesClient
        invoiceData={invoiceData}
        currentStatusTab={status}
        currentSearch={search}
        currentStartDate={startDate}
        currentEndDate={endDate}
        stats={stats}
      />
    </div>
  )
}
