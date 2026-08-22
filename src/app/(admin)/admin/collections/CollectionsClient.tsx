"use client"

import { DataTable } from "@/components/admin/ui/DataTable"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { hardDeleteCollectionAction } from "@/actions/admin/collections.actions"

interface CollectionsClientProps {
  collections: {
    id: string
    name: string
    slug: string
    imageUrl?: string | null
    bannerUrl?: string | null
    isActive: boolean
    sortOrder: number
    productCount: number
  }[]
}

export function CollectionsClient({ collections }: CollectionsClientProps) {
  const router = useRouter()

  const columns = [
    {
      accessorKey: "imageUrl",
      header: "Photo",
      cell: ({ row }: any) => {
        const item = row.original
        const photo = item.imageUrl || item.bannerUrl
        return (
          <div className="w-10 h-14 bg-admin-content border border-admin-border rounded-sm overflow-hidden flex items-center justify-center relative flex-shrink-0">
            {photo ? (
              <img
                src={photo}
                alt={item.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span className="text-[8px] text-admin-text-secondary/50 font-bold uppercase tracking-wider">
                No Img
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Collection",
      cell: ({ row }: any) => {
        const item = row.original
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-admin-text-primary hover:text-admin-primary transition-colors leading-tight">
              {item.name}
            </span>
            <span className="text-admin-xs text-admin-text-secondary font-mono mt-0.5">{item.slug}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: () => (
        <span className="text-admin-text-secondary text-admin-sm font-medium">Manual</span>
      ),
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }: any) => (
        <span className="text-admin-text-primary font-medium">
          {row.getValue("productCount")} product(s)
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => {
        const isActive = row.getValue("isActive")
        return (
          <StatusBadge
            status={isActive ? "ACTIVE" : "INACTIVE"}
          />
        )
      },
    },
    {
      accessorKey: "sortOrder",
      header: "Sort Order",
      cell: ({ row }: any) => (
        <span className="font-mono text-admin-text-secondary text-admin-sm">
          {row.getValue("sortOrder")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => {
        const item = row.original
        return (
          <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
            <Link
              href={`/admin/collections/${item.id}`}
              className="text-admin-xs uppercase tracking-wider font-bold text-admin-text-secondary hover:text-admin-primary transition-colors"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation()
                if (!confirm(`Are you sure you want to delete collection "${item.name}"? This action cannot be undone.`)) return
                const res = await hardDeleteCollectionAction(item.id)
                if (res.success) {
                  router.refresh()
                } else {
                  alert(res.error || "Failed to delete collection.")
                }
              }}
              className="text-admin-xs uppercase tracking-wider font-bold text-red-500 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )
      },
    },
  ]

  const handleRowClick = (row: any) => {
    router.push(`/admin/collections/${row.id}`)
  }

  return (
    <DataTable
      columns={columns}
      data={collections}
      onRowClick={handleRowClick}
      emptyStateText="No collections configured yet."
    />
  )
}
