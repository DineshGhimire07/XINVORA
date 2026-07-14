"use client"

import { DataTable } from "@/components/admin/ui/DataTable"
import Link from "next/link"

interface TagsClientProps {
  tags: {
    id: string
    name: string
    slug: string
    usageCount: number
  }[]
}

export function TagsClient({ tags }: TagsClientProps) {
  const columns = [
    {
      accessorKey: "name",
      header: "Tag Name",
      cell: ({ row }: any) => (
        <span className="font-semibold text-admin-text-primary">
          #{row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }: any) => (
        <span className="font-mono text-admin-text-secondary text-admin-xs">
          {row.getValue("slug")}
        </span>
      ),
    },
    {
      accessorKey: "usageCount",
      header: "Products Tagged",
      cell: ({ row }: any) => (
        <span className="text-admin-text-secondary text-admin-sm">
          {row.getValue("usageCount")} product(s)
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => {
        const item = row.original
        return (
          <div className="flex justify-end">
            <Link
              href={`/admin/tags/${item.id}`}
              className="text-admin-xs uppercase tracking-wider font-bold text-admin-text-secondary hover:text-admin-primary transition-colors"
            >
              Edit
            </Link>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={tags}
      emptyStateText="No tags configured yet."
    />
  )
}
