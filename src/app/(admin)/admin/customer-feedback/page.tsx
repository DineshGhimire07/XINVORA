import { Metadata } from "next"
import { SessionService } from "@/services/session.service"
import { InquiryService } from "@/services/inquiry.service"
import { db } from "@/db/client"
import { backInStockRequests } from "@/db/schema"
import { desc } from "drizzle-orm"
import { CustomerFeedbackClient } from "./CustomerFeedbackClient"

export const metadata: Metadata = {
  title: "Customer Feedback | Admin Dashboard",
}

export default async function CustomerFeedbackPage(props: {
  searchParams: Promise<{ page?: string; status?: string; tab?: string }>
}) {
  await SessionService.requireAdmin()

  const searchParams = await props.searchParams
  const page = parseInt(searchParams.page || "1", 10)
  const status = searchParams.status || "all"

  const { data: inquiries, totalPages } = await InquiryService.getInquiries({
    page,
    limit: 30,
    status,
  })

  const stockAlerts = await db
    .select()
    .from(backInStockRequests)
    .orderBy(desc(backInStockRequests.createdAt))
    .limit(100)

  const tab = searchParams.tab || "inquiries"

  return (
    <CustomerFeedbackClient
      inquiries={inquiries}
      stockAlerts={stockAlerts}
      totalPages={totalPages}
      currentPage={page}
      currentStatus={status}
      initialTab={tab === "stock-alerts" ? "stock-alerts" : "inquiries"}
    />
  )
}
