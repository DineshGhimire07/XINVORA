"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createTagAction, updateTagAction, deleteTagAction } from "@/actions/admin/tags.actions"

export default function TagEditor({ tag }: { tag?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    let result
    if (tag) {
      result = await updateTagAction(tag.id, formData)
    } else {
      result = await createTagAction(formData)
    }

    if (result.success) {
      router.push("/admin/tags")
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!tag) return
    if (!confirm("Are you sure you want to delete this tag? This action cannot be undone.")) return
    
    setIsLoading(true)
    const result = await deleteTagAction(tag.id)
    if (result.success) {
      router.push("/admin/tags")
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
            Tag Name *
          </label>
          <input 
            id="name"
            name="name" 
            defaultValue={tag?.name}
            required
            placeholder="e.g. Vintage, Summer, Premium"
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
            defaultValue={tag?.slug}
            required
            placeholder="e.g. vintage, summer, premium"
            className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-admin-border">
          {tag ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-admin-status-danger-text text-admin-sm font-semibold underline hover:text-admin-status-danger-text/80 transition-colors"
            >
              Delete Tag
            </button>
          ) : (
            <div />
          )}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/tags")}
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
              {isLoading ? "Saving..." : "Save Tag"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
