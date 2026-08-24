"use client"

import { useState } from "react"
import { DataTable } from "@/components/admin/ui/DataTable"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { hardDeleteCollectionAction } from "@/actions/admin/collections.actions"
import { CollectionBulkImportModal } from "@/components/admin/CollectionBulkImportModal"
import { Download, Upload, Plus } from "lucide-react"
import { toast } from "sonner"

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
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)

  // Download Header-Only CSV Template (strictly NO sample collection data)
  const handleDownloadTemplate = () => {
    const csvHeader = "Name,Slug,Description,Image URL,Image Mobile URL,Banner URL,Sort Order,Is Active,SEO Title,SEO Description,Parent Slug\n"
    const blob = new Blob([csvHeader], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "xinvora_collections_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("CSV Template downloaded (headers only)")
  }

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
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-admin-card p-4 rounded-admin-md border border-admin-border">
        <div className="flex items-center gap-2">
          <span className="text-admin-sm font-semibold text-admin-text-primary">
            {collections.length} {collections.length === 1 ? "Collection" : "Collections"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md border border-admin-border bg-admin-content/40 hover:bg-admin-content text-admin-text-primary transition-colors shadow-xs"
            title="Download blank CSV template with column headers only"
          >
            <Download className="w-3.5 h-3.5 text-admin-text-secondary" />
            <span>Download Template</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md border border-admin-border bg-admin-content/40 hover:bg-admin-content text-admin-text-primary transition-colors shadow-xs"
            title="Import multiple collections from CSV"
          >
            <Upload className="w-3.5 h-3.5 text-admin-text-secondary" />
            <span>Bulk Import</span>
          </button>

          <Link
            href="/admin/collections/new"
            className="inline-flex items-center gap-1.5 bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 px-4 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Collection</span>
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={collections}
        onRowClick={handleRowClick}
        emptyStateText="No collections configured yet."
      />

      <CollectionBulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </div>
  )
}

