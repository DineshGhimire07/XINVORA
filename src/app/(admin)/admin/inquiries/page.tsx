import { Metadata } from "next"
import Link from "next/link"
import { SessionService } from "@/services/session.service"
import { InquiryService } from "@/services/inquiry.service"
import { InquiriesTable } from "./InquiriesTable"

export const metadata: Metadata = {
  title: "Inquiries | Admin Dashboard",
}

export default async function AdminInquiriesPage(props: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  await SessionService.requireAdmin()

  const searchParams = await props.searchParams
  const page = parseInt(searchParams.page || "1", 10)
  const status = searchParams.status || "all"

  const { data: inquiries, totalPages } = await InquiryService.getInquiries({
    page,
    limit: 20,
    status,
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-display-sm font-display uppercase tracking-wider text-text-primary">
            Customer Inquiries
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage contact form submissions and customer correspondence.
          </p>
        </div>
      </div>

      {/* Filters (Basic) */}
      <div className="flex gap-2">
        <Link 
          href="/admin/inquiries?status=all"
          className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border rounded ${status === 'all' || !status ? 'bg-text-primary text-white border-text-primary' : 'bg-surface border-border text-text-secondary hover:bg-surface-secondary'}`}
        >
          All
        </Link>
        <Link 
          href="/admin/inquiries?status=NEW"
          className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border rounded ${status === 'NEW' ? 'bg-red-700 text-white border-red-700' : 'bg-surface border-border text-text-secondary hover:bg-surface-secondary'}`}
        >
          New
        </Link>
        <Link 
          href="/admin/inquiries?status=READ"
          className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border rounded ${status === 'READ' ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-surface border-border text-text-secondary hover:bg-surface-secondary'}`}
        >
          Read
        </Link>
        <Link 
          href="/admin/inquiries?status=RESPONDED"
          className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border rounded ${status === 'RESPONDED' ? 'bg-green-700 text-white border-green-700' : 'bg-surface border-border text-text-secondary hover:bg-surface-secondary'}`}
        >
          Responded
        </Link>
      </div>

      {/* Table */}
      <InquiriesTable inquiries={inquiries} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/inquiries?page=${i + 1}&status=${status}`}
              className={`w-8 h-8 flex items-center justify-center rounded border ${
                page === i + 1
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-surface border-border text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
