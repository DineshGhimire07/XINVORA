"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCollectionAction, updateCollectionAction, archiveCollectionAction } from "@/actions/admin/collections.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CollectionEditor({ collection, collections }: { collection?: any, collections?: any[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

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
            <label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Collection Name
            </label>
            <input 
              id="name"
              name="name" 
              defaultValue={collection?.name}
              required
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="slug" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Slug (URL)
              </label>
              <input 
                id="slug"
                name="slug" 
                defaultValue={collection?.slug}
                required
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="sortOrder" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Sort Order
              </label>
              <input 
                id="sortOrder"
                name="sortOrder" 
                type="number"
                defaultValue={collection?.sortOrder ?? 0}
                required
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="parentId" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Parent Collection
            </label>
            <select 
              id="parentId"
              name="parentId" 
              defaultValue={collection?.parentId || ""}
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            >
              <option value="">None (Top Level)</option>
              {collections?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Description
            </label>
            <textarea 
              id="description"
              name="description" 
              defaultValue={collection?.description}
              rows={4}
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>
          
          <div className="flex flex-col gap-2 border-t border-border/40 pt-6 mt-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary mb-2">
              SEO Settings
            </label>
            <div className="flex flex-col gap-4">
              <input 
                id="seoTitle"
                name="seoTitle" 
                placeholder="SEO Title"
                defaultValue={collection?.seoTitle}
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
              <textarea 
                id="seoDescription"
                name="seoDescription" 
                placeholder="SEO Description"
                defaultValue={collection?.seoDescription}
                rows={2}
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/40">
            {collection ? (
              <button
                type="button"
                onClick={handleArchive}
                disabled={isLoading}
                className="text-red-600 text-body-sm underline tracking-wide hover:text-red-800 transition-colors"
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
                className="text-text-secondary text-body-sm tracking-wide hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-text-primary text-surface px-8 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors"
              >
                {isLoading ? "Saving..." : "Save Collection"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
