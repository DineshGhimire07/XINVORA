"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2, GripVertical, Check } from "lucide-react"

interface CollectionItem {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
}

interface AdminCollectionPickerProps {
  allCollections: CollectionItem[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  mode?: "single" | "multi"
  label?: string
  maxItems?: number
}

export default function AdminCollectionPicker({
  allCollections = [],
  selectedIds = [],
  onChange,
  mode = "multi",
  label = "Select Collections",
  maxItems = 20,
}: AdminCollectionPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleSelectCollection = (id: string) => {
    if (mode === "single") {
      onChange([id])
      setSearchQuery("")
    } else {
      if (selectedIds.includes(id)) return
      if (selectedIds.length >= maxItems) {
        alert(`You can select a maximum of ${maxItems} items.`)
        return
      }
      onChange([...selectedIds, id])
    }
  }

  const handleRemoveCollection = (id: string) => {
    onChange(selectedIds.filter((x) => x !== id))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return
    const newIds = [...selectedIds]
    const [draggedItem] = newIds.splice(draggedIndex, 1)
    newIds.splice(index, 0, draggedItem)
    setDraggedIndex(index)
    onChange(newIds)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const filteredCollections = allCollections.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const notSelected = mode === "single" ? true : !selectedIds.includes(c.id)
    return matchesSearch && notSelected
  })

  const selectedCollections = selectedIds
    .map((id) => allCollections.find((coll) => coll.id === id))
    .filter(Boolean) as CollectionItem[]

  return (
    <div className="space-y-4">
      {label && (
        <Label className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider block">
          {label}
        </Label>
      )}

      {mode === "single" ? (
        <div className="space-y-3">
          {selectedCollections.length > 0 ? (
            <div className="flex items-center justify-between p-3 bg-admin-surface border border-admin-border rounded-admin-md">
              <div>
                <p className="text-admin-sm font-semibold text-admin-text-primary">
                  {selectedCollections[0].name}
                </p>
                <p className="text-admin-xs text-admin-text-secondary">
                  /{selectedCollections[0].slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-red-500 hover:text-red-600 transition-colors p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <p className="text-admin-xs text-admin-text-secondary italic">
              No collection selected
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {selectedCollections.length > 0 ? (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {selectedCollections.map((coll, index) => (
                <div
                  key={coll.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-2.5 bg-admin-surface border border-admin-border rounded-admin-md transition-all ${
                    draggedIndex === index ? "opacity-40 scale-[0.98]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="cursor-grab active:cursor-grabbing text-admin-text-secondary">
                      <GripVertical size={16} />
                    </div>
                    <div>
                      <p className="text-admin-sm font-semibold text-admin-text-primary">
                        {coll.name}
                      </p>
                      <p className="text-admin-xs text-admin-text-secondary">
                        /{coll.slug}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCollection(coll.id)}
                    className="text-admin-text-secondary hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-admin-xs text-admin-text-secondary italic">
              No collections selected
            </p>
          )}
        </div>
      )}

      {/* Selector Dropdown / Search Input */}
      {selectedIds.length < maxItems && (
        <div className="relative border border-admin-border rounded-admin-md bg-admin-surface p-1">
          <div className="flex items-center gap-2 px-2.5 py-2">
            <Search size={16} className="text-admin-text-secondary" />
            <Input
              type="text"
              placeholder="Search collections to attach..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent h-auto p-0 focus-visible:ring-0 text-admin-sm"
            />
          </div>

          {searchQuery && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-admin-surface border border-admin-border rounded-admin-md shadow-lg max-h-[220px] overflow-y-auto z-50">
              {filteredCollections.length > 0 ? (
                <div className="p-1.5 space-y-0.5">
                  {filteredCollections.map((coll) => (
                    <button
                      key={coll.id}
                      type="button"
                      onClick={() => handleSelectCollection(coll.id)}
                      className="w-full flex items-center justify-between text-left px-3 py-2 text-admin-sm hover:bg-admin-surface-hover rounded-admin-sm text-admin-text-primary transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-admin-text-primary">{coll.name}</p>
                        <p className="text-admin-xs text-admin-text-secondary">/{coll.slug}</p>
                      </div>
                      <Plus size={16} className="text-admin-text-secondary group-hover:text-admin-text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-admin-xs text-admin-text-secondary">
                  No matching collections found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
