import { SessionService } from "@/services/session.service"
import { getCustomersAction } from "@/actions/admin/customers.actions"
import { UsersClient } from "./UsersClient"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Customers | XINVORA Admin",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
  }>
}

export default async function AdminUsersPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ""
  const limit = 20

  const res = await getCustomersAction({ page, limit, search })
  if (!res.success || !res.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          Customers
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          View customer purchase history, profile information, and saved delivery addresses.
        </p>
      </div>

      <UsersClient
        customersData={res.data}
        currentSearch={search}
      />
    </div>
  )
}
