"use client"

import { DataTable } from "@/components/admin/ui/DataTable"
import Link from "next/link"

interface AttributesClientProps {
  attributes: {
    id: string
    name: string
    valuesList: string
  }[]
}

export function AttributesClient({ attributes }: AttributesClientProps) {
  const columns = [
    {
      accessorKey: "name",
      header: "Attribute Name",
      cell: ({ row }: any) => (
        <span className="font-semibold text-admin-text-primary">
          {row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "valuesList",
      header: "Values",
      cell: ({ row }: any) => {
        const valStr = row.getValue("valuesList")
        const vals = valStr ? valStr.split(", ") : []
        return (
          <div className="flex flex-wrap gap-1">
            {vals.length > 0 ? (
              vals.map((v: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-admin-content/10 border border-admin-border text-admin-text-secondary text-[10px] rounded-admin-sm font-medium"
                >
                  {v}
                </span>
              ))
            ) : (
              <span className="text-admin-text-secondary text-admin-xs italic">No values configured</span>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => {
        const item = row.original
        return (
          <div className="flex justify-end">
            <Link
              href={`/admin/attributes/${item.id}`}
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
      data={attributes}
      emptyStateText="No attributes configured yet."
    />
  )
}
