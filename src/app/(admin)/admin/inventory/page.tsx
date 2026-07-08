import { findAdminInventoryPaginated } from "@/db/queries/inventory"
import Image from "next/image"
import { Stack } from "@/components/shared/stack"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { DeleteInventoryButton } from "@/components/admin/DeleteInventoryButton"

export default async function AdminInventoryPage(props: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ""
  const status = searchParams.status || ""

  const result = await findAdminInventoryPaginated({
    page,
    limit: 20,
    search,
    status,
    sortBy: "updatedAt",
    sortOrder: "desc",
  })

  return (
    <Stack gap={8}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide">
            Inventory
          </h1>
          <p className="text-body-sm text-text-secondary mt-2">
            Monitor variant stock levels and availability.
          </p>
        </div>
      </div>

      <Card className="rounded-none border-border-primary/40 shadow-sm bg-surface">
        <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
          <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
            Stock Levels ({result.total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-secondary/30 text-[10px] uppercase tracking-wider text-text-secondary border-b border-border/40">
                <tr>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium">Product & Variant</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Physical Qty</th>
                  <th className="px-6 py-4 font-medium text-right">Reserved</th>
                  <th className="px-6 py-4 font-medium text-right">Available Stock</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {result.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                      No inventory records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  result.items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-text-primary">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <div className="relative w-9 h-11 bg-[#eaeaea] overflow-hidden border border-border/20 flex-shrink-0 select-none">
                              <Image 
                                src={item.imageUrl} 
                                alt={item.productName} 
                                fill
                                className="object-cover object-top"
                                sizes="36px"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-11 bg-surface-secondary/50 border border-border/20 flex items-center justify-center text-[7px] text-text-secondary uppercase flex-shrink-0 font-bold">
                              No Image
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-text-primary">{item.productName}</div>
                            <div className="text-[10px] text-text-secondary mt-0.5">
                              {item.color && <span>{item.color} </span>}
                              {item.size && <span>{item.size}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 border ${
                          item.status === "IN_STOCK" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : item.status === "LOW_STOCK"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-text-secondary">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-text-secondary">
                        {item.reserved}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${(item.quantity - item.reserved) < 10 ? 'text-accent' : 'text-text-primary'}`}>
                        {item.quantity - item.reserved}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DeleteInventoryButton inventoryId={item.id} sku={item.sku} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-border/40 bg-surface-secondary/10">
              <span className="text-body-xs text-text-secondary">
                Page {result.currentPage} of {result.totalPages}
              </span>
              <div className="flex gap-4">
                {result.currentPage > 1 && (
                  <Link 
                    href={`/admin/inventory?page=${result.currentPage - 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                    className="text-[10px] uppercase tracking-wider font-bold hover:text-accent"
                  >
                    Previous
                  </Link>
                )}
                {result.currentPage < result.totalPages && (
                  <Link 
                    href={`/admin/inventory?page=${result.currentPage + 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                    className="text-[10px] uppercase tracking-wider font-bold hover:text-accent"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
