"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCollectionAction, updateCollectionAction, archiveCollectionAction } from "@/actions/admin/collections.actions"
import { Search } from "lucide-react"

export default function CollectionEditor({
  collection,
  collections,
  allProducts = [],
  initialProductIds = [],
}: {
  collection?: any
  collections?: any[]
  allProducts?: any[]
  initialProductIds?: string[]
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialProductIds)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    // Add productIds to formData explicitly
    formData.delete("productIds") // clear any default inputs
    selectedProductIds.forEach((id) => formData.append("productIds", id))

    let result
    if (collection) {
      result = await updateCollectionAction(collection.id, formData)
    } else {
      result = await createCollectionAction(formData)
    }

    if (result.success) {
      router.push("/admin/collections")
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleArchive = async () => {
    if (!collection) return
    if (!confirm("Are you sure you want to archive this collection?")) return

    setIsLoading(true)
    const result = await archiveCollectionAction(collection.id)
    if (result.success) {
      router.push("/admin/collections")
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  const handleToggleProduct = (pId: string) => {
    if (selectedProductIds.includes(pId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== pId))
    } else {
      setSelectedProductIds([...selectedProductIds, pId])
    }
  }

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-admin-status-danger-bg/25 border border-admin-status-danger-text/30 text-admin-status-danger-text text-admin-sm rounded-admin-md font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Collection Details
          </h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
              Collection Name *
            </label>
            <input
              id="name"
              name="name"
              defaultValue={collection?.name}
              required
              className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="slug" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Slug (URL) *
              </label>
              <input
                id="slug"
                name="slug"
                defaultValue={collection?.slug}
                required
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sortOrder" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Sort Order
              </label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={collection?.sortOrder ?? 0}
                required
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="parentId" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Parent Collection
              </label>
              <select
                id="parentId"
                name="parentId"
                defaultValue={collection?.parentId || ""}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong transition-colors"
              >
                <option value="">None (Top Level)</option>
                {collections?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="isActive" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Status
              </label>
              <select
                id="isActive"
                name="isActive"
                defaultValue={collection?.isActive !== false ? "true" : "false"}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong transition-colors"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={collection?.description}
              rows={4}
              className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Product Assignment */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <div className="flex justify-between items-center border-b border-admin-border pb-3">
            <h3 className="text-admin-base font-bold text-admin-text-primary">
              Product Assignment
            </h3>
            <span className="text-admin-xs text-admin-text-secondary font-semibold">
              {selectedProductIds.length} product(s) selected
            </span>
          </div>

          {/* Search box */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products to add..."
              className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-10 pr-4 py-1.5 text-admin-sm text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
            />
          </div>

          {/* Product checklist */}
          <div className="max-h-60 overflow-y-auto border border-admin-border p-2 bg-admin-content rounded-admin-md divide-y divide-admin-border/50">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id)
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2.5 p-2.5 text-admin-sm text-admin-text-primary cursor-pointer hover:bg-admin-content-hover/40 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleProduct(p.id)}
                      className="rounded border-admin-border text-admin-primary focus:ring-admin-primary"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold leading-tight">{p.name}</span>
                      <span className="text-[10px] text-admin-text-secondary font-mono mt-0.5">{p.slug}</span>
                    </div>
                  </label>
                )
              })
            ) : (
              <div className="p-6 text-center text-admin-sm text-admin-text-secondary italic">
                No active products found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: SEO settings */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Search Engine Optimization (SEO)
          </h3>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="seoTitle" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                SEO Meta Title
              </label>
              <input
                id="seoTitle"
                name="seoTitle"
                defaultValue={collection?.seoTitle}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="seoDescription" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                SEO Meta Description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                defaultValue={collection?.seoDescription}
                rows={2}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>
          </div>
        </div>

        {/* Form controls panel */}
        <div className="flex justify-between items-center pt-4">
          {collection ? (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isLoading}
              className="text-admin-status-danger-text text-admin-sm font-semibold underline hover:text-admin-status-danger-text/80 transition-colors"
            >
              Archive Collection
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/collections")}
              disabled={isLoading}
              className="text-admin-text-secondary text-admin-sm font-semibold hover:text-admin-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-admin-primary text-admin-primary-on px-6 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-admin-primary/95 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Collection"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
