"use client"

import { DataTable } from "@/components/admin/ui/DataTable"
import Link from "next/link"

interface CategoriesClientProps {
  categories: {
    id: string
    name: string
    slug: string
    createdAt: Date
  }[]
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const columns = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }: any) => (
        <span className="font-semibold text-admin-text-primary">
          {row.getValue("name")}
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
      id: "actions",
      header: "",
      cell: ({ row }: any) => {
        const item = row.original
        return (
          <div className="flex justify-end">
            <Link
              href={`/admin/categories/${item.id}`}
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
      data={categories}
      emptyStateText="No categories configured yet."
    />
  )
}
