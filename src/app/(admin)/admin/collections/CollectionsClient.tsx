"use client"

import { DataTable } from "@/components/admin/ui/DataTable"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CollectionsClientProps {
  collections: {
    id: string
    name: string
    slug: string
    isActive: boolean
    sortOrder: number
    productCount: number
  }[]
}

export function CollectionsClient({ collections }: CollectionsClientProps) {
  const router = useRouter()

  const columns = [
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
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Link
              href={`/admin/collections/${item.id}`}
              className="text-admin-xs uppercase tracking-wider font-bold text-admin-text-secondary hover:text-admin-primary transition-colors"
            >
              Edit
            </Link>
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
