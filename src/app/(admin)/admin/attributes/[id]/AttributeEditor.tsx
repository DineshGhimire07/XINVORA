"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAttributeAction, updateAttributeAction, deleteAttributeAction } from "@/actions/admin/attributes.actions"
import { Trash2, Plus } from "lucide-react"

export default function AttributeEditor({ attribute }: { attribute?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState<string[]>(
    attribute?.values?.length ? attribute.values.map((v: any) => v.value) : [""]
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const filteredValues = values.map(v => v.trim()).filter(Boolean)
    if (filteredValues.length === 0) {
      setError("Please add at least one value for this attribute.")
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    let result
    if (attribute) {
      result = await updateAttributeAction(attribute.id, formData)
    } else {
      result = await createAttributeAction(formData)
    }

    if (result.success) {
      router.push("/admin/attributes")
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!attribute) return
    if (!confirm("Are you sure you want to delete this attribute? All configured values will be lost.")) return
    
    setIsLoading(true)
    const result = await deleteAttributeAction(attribute.id)
    if (result.success) {
      router.push("/admin/attributes")
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  const handleAddValue = () => {
    setValues([...values, ""])
  }

  const handleRemoveValue = (index: number) => {
    if (values.length === 1) {
      setValues([""])
      return
    }
    setValues(values.filter((_, i) => i !== index))
  }

  const handleValueChange = (index: number, val: string) => {
    const updated = [...values]
    updated[index] = val
    setValues(updated)
  }

  return (
    <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 shadow-xs">
      {error && (
        <div className="mb-6 p-4 bg-admin-status-danger-bg/25 border border-admin-status-danger-text/30 text-admin-status-danger-text text-admin-sm rounded-admin-md font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
            Attribute Name *
          </label>
          <input 
            id="name"
            name="name" 
            defaultValue={attribute?.name}
            required
            placeholder="e.g. Fit, Material, Neckline"
            className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
          />
        </div>

        {/* Dynamic Values Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-admin-border pb-2">
            <label className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
              Attribute Values *
            </label>
            <button
              type="button"
              onClick={handleAddValue}
              className="inline-flex items-center gap-1 text-admin-xs text-admin-primary hover:underline font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Value
            </button>
          </div>

          <div className="space-y-2">
            {values.map((val, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  name="values"
                  value={val}
                  required
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  placeholder="e.g. Slim Fit, Cotton, Crew Neck"
                  className="w-full px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveValue(index)}
                  className="p-2 border border-admin-border rounded-admin-md hover:bg-admin-status-danger-bg/15 hover:border-admin-status-danger-text/30 text-admin-text-secondary hover:text-admin-status-danger-text transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-admin-border">
          {attribute ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-admin-status-danger-text text-admin-sm font-semibold underline hover:text-admin-status-danger-text/80 transition-colors"
            >
              Delete Attribute
            </button>
          ) : (
            <div />
          )}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/attributes")}
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
              {isLoading ? "Saving..." : "Save Attribute"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
