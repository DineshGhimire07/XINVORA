"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createMaterialAction, updateMaterialAction, archiveMaterialAction } from "@/actions/admin/materials.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MaterialEditor({ material }: { material?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    let result
    if (material) {
      result = await updateMaterialAction(material.id, formData)
    } else {
      result = await createMaterialAction(formData)
    }

    if (result.success) {
      router.push("/admin/materials")
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleArchive = async () => {
    if (!material) return
    if (!confirm("Are you sure you want to archive this material?")) return
    
    setIsLoading(true)
    const result = await archiveMaterialAction(material.id)
    if (result.success) {
      router.push("/admin/materials")
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
              Material Name
            </label>
            <input 
              id="name"
              name="name" 
              defaultValue={material?.name}
              required
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Description
            </label>
            <textarea 
              id="description"
              name="description" 
              defaultValue={material?.description}
              rows={4}
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/40">
            {material ? (
              <button
                type="button"
                onClick={handleArchive}
                disabled={isLoading}
                className="text-red-600 text-body-sm underline tracking-wide hover:text-red-800 transition-colors"
              >
                Archive Material
              </button>
            ) : (
              <div />
            )}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/materials")}
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
                {isLoading ? "Saving..." : "Save Material"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
