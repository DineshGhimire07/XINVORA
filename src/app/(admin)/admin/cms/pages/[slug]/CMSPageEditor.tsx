"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCMSPageAction, updateCMSPageAction, archiveCMSPageAction } from "@/actions/admin/cms.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CMSPageEditor({ page }: { page?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    let result
    if (page) {
      result = await updateCMSPageAction(page.id, formData)
    } else {
      result = await createCMSPageAction(formData)
    }

    if (result.success) {
      router.push("/admin/cms/pages")
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleArchive = async () => {
    if (!page) return
    if (!confirm("Are you sure you want to archive this page?")) return
    
    setIsLoading(true)
    const result = await archiveCMSPageAction(page.id)
    if (result.success) {
      router.push("/admin/cms/pages")
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card className="rounded-none border-border-primary/40 bg-surface">
      <CardContent className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-body-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Page Title
            </label>
            <input 
              id="title"
              name="title" 
              defaultValue={page?.title}
              required
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="slug" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Slug (URL path)
            </label>
            <input 
              id="slug"
              name="slug" 
              defaultValue={page?.slug}
              required
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="seoTitle" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              SEO Title
            </label>
            <input 
              id="seoTitle"
              name="seoTitle" 
              defaultValue={page?.seoTitle}
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="seoDescription" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              SEO Description
            </label>
            <textarea 
              id="seoDescription"
              name="seoDescription" 
              defaultValue={page?.seoDescription}
              rows={3}
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Status
            </label>
            <select 
              id="status"
              name="status" 
              defaultValue={page?.status || "DRAFT"}
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/40">
            {page ? (
              <button
                type="button"
                onClick={handleArchive}
                disabled={isLoading}
                className="text-red-600 text-body-sm underline tracking-wide hover:text-red-800 transition-colors"
              >
                Archive Page
              </button>
            ) : (
              <div />
            )}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/cms/pages")}
                disabled={isLoading}
                className="text-text-secondary text-body-sm tracking-wide hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-text-primary text-surface px-8 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors"
              >
                {isLoading ? "Saving..." : "Save Page Settings"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
