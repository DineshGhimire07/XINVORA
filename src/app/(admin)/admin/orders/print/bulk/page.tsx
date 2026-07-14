import { SessionService } from "@/services/session.service"
import { notFound } from "next/navigation"
import { db } from "@/db/client"
import { orders } from "@/db/schema/orders"
import { inArray } from "drizzle-orm"
import { BulkPrintClient } from "./BulkPrintClient"
import { AdminOrdersService } from "@/services/admin/orders.service"

export const metadata = {
  title: "Bulk Print Invoices | XINVORA Admin",
}

interface PageProps {
  searchParams: Promise<{
    ids?: string
  }>
}

export default async function BulkPrintPage(props: PageProps) {
  // Require Admin gate
  await SessionService.requireAdmin()

  const searchParams = await props.searchParams
  const idsString = searchParams.ids || ""
  const orderIds = idsString.split(",").filter(Boolean)

  if (orderIds.length === 0) {
    return notFound()
  }

  // Fetch all orders with items, addresses, and images
  const selectedOrders = await db.query.orders.findMany({
    where: inArray(orders.id, orderIds),
    with: {
      user: true,
      orderItems: {
        with: {
          variant: {
            with: {
              product: {
                with: {
                  productImages: true
                }
              },
              color: true,
              size: true
            }
          }
        }
      }
    }
  })

  if (selectedOrders.length === 0) {
    return notFound()
  }

  // Ensure invoice numbers exist for all selected orders
  for (const order of selectedOrders) {
    if (!order.invoiceNumber) {
      order.invoiceNumber = await AdminOrdersService.ensureInvoiceNumber(order.id)
    }
  }

  return <BulkPrintClient initialOrders={selectedOrders} />
}
