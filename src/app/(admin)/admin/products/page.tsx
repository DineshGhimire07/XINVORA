import { findAdminProductsPaginated } from "@/db/queries/products"
import Image from "next/image"
import { Stack } from "@/components/shared/stack"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DeleteProductButton } from "@/components/admin/DeleteProductButton"

export default async function AdminProductsPage(props: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ""
  const status = searchParams.status || ""

  const result = await findAdminProductsPaginated({
    page,
    limit: 20,
    search,
    status,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  return (
    <Stack gap={8}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide">
            Products
          </h1>
          <p className="text-body-sm text-text-secondary mt-2">
            Manage the catalog and product details.
          </p>
        </div>
        <div>
          <Link href="/admin/products/create">
            <Button className="bg-text-primary text-surface px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors rounded-none">
              + New Product
            </Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-none border-border-primary/40 shadow-sm bg-surface">
        <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
          <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
            All Products ({result.total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-secondary/30 text-[10px] uppercase tracking-wider text-text-secondary border-b border-border/40">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Base Price</th>
                  <th className="px-6 py-4 font-medium">Date Added</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {result.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                      No products found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  result.items.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 select-none rounded-sm">
                            {(product as any).productImages?.[0]?.url ? (
                              <Image 
                                src={(product as any).productImages[0].url} 
                                alt={product.name} 
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[7px] text-text-secondary uppercase select-none">
                                No Image
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">{product.name}</div>
                            <div className="text-[10px] text-text-secondary mt-0.5">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 border ${
                          product.status === "PUBLISHED" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : product.status === "DRAFT"
                            ? "bg-surface-secondary text-text-secondary border-border"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-text-secondary">
                        {/* Placeholder until PriceBook mapping is joined to this view */}
                        --
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link 
                          href={`/admin/products/${product.id}`}
                          className="text-[10px] uppercase tracking-wider underline hover:text-accent font-semibold text-text-secondary inline-block"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
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
                    href={`/admin/products?page=${result.currentPage - 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                    className="text-[10px] uppercase tracking-wider font-bold hover:text-accent"
                  >
                    Previous
                  </Link>
                )}
                {result.currentPage < result.totalPages && (
                  <Link 
                    href={`/admin/products?page=${result.currentPage + 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
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
