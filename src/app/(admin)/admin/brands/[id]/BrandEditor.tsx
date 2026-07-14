"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrandAction, updateBrandAction, archiveBrandAction } from "@/actions/admin/brands.actions"

export default function BrandEditor({ brand }: { brand?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    let result
    if (brand) {
      result = await updateBrandAction(brand.id, formData)
    } else {
      result = await createBrandAction(formData)
    }

    if (result.success) {
      router.push("/admin/brands")
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleArchive = async () => {
    if (!brand) return
    if (!confirm("Are you sure you want to archive this brand?")) return
    
    setIsLoading(true)
    const result = await archiveBrandAction(brand.id)
    if (result.success) {
      router.push("/admin/brands")
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 shadow-xs">
      {error && (
        <div className="mb-6 p-4 bg-admin-status-danger-bg/25 border border-admin-status-danger-text/30 text-admin-status-danger-text text-admin-sm rounded-admin-md font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
            Brand Name *
          </label>
          <input 
            id="name"
            name="name" 
            defaultValue={brand?.name}
            required
            className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
            Slug (URL) *
          </label>
          <input 
            id="slug"
            name="slug" 
            defaultValue={brand?.slug}
            required
            className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
            Description
          </label>
          <textarea 
            id="description"
            name="description" 
            defaultValue={brand?.description}
            rows={4}
            className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all leading-relaxed"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-admin-border">
          {brand ? (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isLoading}
              className="text-admin-status-danger-text text-admin-sm font-semibold underline hover:text-admin-status-danger-text/80 transition-colors"
            >
              Archive Brand
            </button>
          ) : (
            <div />
          )}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/brands")}
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
              {isLoading ? "Saving..." : "Save Brand"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
