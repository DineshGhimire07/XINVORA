import { SessionService } from "@/services/session.service"
import {
  getDarazInventoryStats,
  findDarazInventoryPaginated,
  getDarazSyncedCategories,
  getDarazSyncControlData,
  getStockReservations,
  getFailedSyncOperations,
} from "@/db/queries/daraz-inventory"
import { DarazInventoryClient } from "./DarazInventoryClient"

export const metadata = {
  title: "Daraz Inventory Hub | XINVORA Admin",
  description: "Live SKU-level stock synchronization, inventory management, and reservation monitoring for Daraz.",
}

export default async function DarazInventoryPage(props: {
  searchParams: Promise<{
    page?: string
    search?: string
    categoryId?: string
    stockStatus?: string
    darazStatus?: string
    publicationStatus?: string
    sortBy?: "stock" | "price" | "lastSync" | "title"
    sortOrder?: "asc" | "desc"
  }>
}) {
  await SessionService.requireAdmin()

  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ""
  const categoryId = searchParams.categoryId || ""
  const stockStatus = (searchParams.stockStatus as any) || ""
  const darazStatus = (searchParams.darazStatus as any) || ""
  const publicationStatus = (searchParams.publicationStatus as any) || ""
  const sortBy = searchParams.sortBy || "lastSync"
  const sortOrder = searchParams.sortOrder || "desc"

  const [metrics, paginated, categories, syncData, reservations, failedLogs] = await Promise.all([
    getDarazInventoryStats(),
    findDarazInventoryPaginated({
      page,
      limit: 50,
      search,
      categoryId,
      stockStatus,
      darazStatus,
      publicationStatus,
      sortBy,
      sortOrder,
    }),
    getDarazSyncedCategories(),
    getDarazSyncControlData(),
    getStockReservations(50),
    getFailedSyncOperations(50),
  ])

  return (
    <DarazInventoryClient
      initialItems={paginated.items}
      totalItems={paginated.total}
      totalPages={paginated.totalPages}
      currentPage={paginated.currentPage}
      metrics={metrics}
      categories={categories}
      syncData={syncData}
      initialReservations={reservations}
      initialFailedLogs={failedLogs}
      searchParams={{
        search,
        categoryId,
        stockStatus,
        darazStatus,
        publicationStatus,
        sortBy,
        sortOrder,
      }}
    />
  )
}
