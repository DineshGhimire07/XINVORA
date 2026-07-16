"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2, GripVertical } from "lucide-react"

interface CollectionGridEditorProps {
  allCollections: any[] // list of all active collections: { id, name, slug, imageUrl }
  initialCollectionIds: string[]
  onChange: (ids: string[]) => void
}

export default function CollectionGridEditor({
  allCollections = [],
  initialCollectionIds = [],
  onChange,
}: CollectionGridEditorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialCollectionIds)
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const updateSelection = (newIds: string[]) => {
    setSelectedIds(newIds)
    onChange(newIds)
  }

  const handleAddCollection = (id: string) => {
    if (selectedIds.includes(id)) return
    if (selectedIds.length >= 4) {
      alert("You can select a maximum of 4 collections for the featured collections section.")
      return
    }
    updateSelection([...selectedIds, id])
  }

  const handleRemoveCollection = (id: string) => {
    updateSelection(selectedIds.filter((cId) => cId !== id))
  }

  // --- Drag and Drop ---
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
    setSelectedIds(newIds)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    onChange(selectedIds)
  }

  // Filter collections for the picker list
  const filteredCollections = allCollections.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const notSelected = !selectedIds.includes(c.id)
    return matchesSearch && notSelected
  })

  // Map selected IDs back to collection details
  const selectedCollections = selectedIds
    .map((id) => allCollections.find((c) => c.id === id))
    .filter(Boolean) as any[]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-text-primary">
          Featured Collections Picker
        </h3>
        <p className="text-body-xs text-text-secondary/70 mt-1">
          Select and arrange up to 4 collections. These will render live as a 4-box editorial layout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Search & Pick list */}
        <div className="lg:col-span-5 space-y-4">
          <Label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
            Search Collections
          </Label>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections..."
              className="pl-10 h-10 rounded-none bg-surface border-border/30 text-body-sm"
            />
          </div>

          <div className="max-h-80 overflow-y-auto border border-border/20 p-2 bg-surface-secondary/10 divide-y divide-border/20">
            {filteredCollections.length > 0 ? (
              filteredCollections.map((c) => {
                const imageUrl = c.imageUrl
                return (
                  <div
                    key={c.id}
                    onClick={() => handleAddCollection(c.id)}
                    className="flex items-center justify-between p-2.5 hover:bg-surface-secondary/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-neutral-100 border border-border/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          <img src={imageUrl} alt={c.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="text-[7px] uppercase font-bold text-text-secondary">No Image</div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold tracking-wider text-text-primary uppercase truncate max-w-[12rem] group-hover:text-text-primary transition-colors">
                          {c.name}
                        </span>
                        <span className="text-[8px] text-text-secondary/60 font-mono mt-0.5">{c.slug}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="h-7 w-7 flex items-center justify-center border border-border/60 bg-surface text-text-primary hover:bg-text-primary hover:text-surface transition-colors rounded-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-body-xs text-text-secondary/60 italic">
                {searchQuery ? "No collections match search." : "No active collections available to pick."}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Reorder grid list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
              Selected Collections Order
            </Label>
            <span className="text-[9px] tracking-widest uppercase font-bold text-text-secondary/60 bg-surface-secondary/50 px-2 py-0.5 border border-border/30">
              {selectedIds.length} / 4 selected
            </span>
          </div>

          <div className="space-y-2 border border-border/20 p-3 bg-surface-secondary/10 max-h-[26rem] overflow-y-auto">
            {selectedCollections.length === 0 ? (
              <div className="p-12 text-center text-body-xs text-text-secondary/60 italic">
                No collections selected yet. Search and pick on the left.
              </div>
            ) : (
              selectedCollections.map((c: any, idx) => {
                const isDragging = draggedIndex === idx
                const imageUrl = c.imageUrl

                return (
                  <div
                    key={c.id}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(idx)}
                    className={`flex items-center justify-between p-3 border bg-surface transition-all select-none duration-150 gap-4 ${
                      isDragging
                        ? "opacity-30 border-text-primary scale-[0.99]"
                        : "border-border/30 hover:border-border-primary/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Drag Handle */}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnd={handleDragEnd}
                        className="cursor-grab active:cursor-grabbing text-text-secondary/40 hover:text-text-primary p-1.5 transition-colors"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Preview Thumbnail */}
                      <div className="relative w-10 h-10 bg-neutral-100 border border-border/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          <img src={imageUrl} alt={c.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="text-[7px] uppercase font-bold text-text-secondary">No Image</div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider text-text-primary uppercase truncate max-w-[12rem]">
                          {c.name}
                        </span>
                        <span className="text-[8px] text-text-secondary/60 font-mono mt-0.5">{c.slug}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCollection(c.id)}
                      className="text-text-secondary/60 hover:text-red-500 transition-colors p-1"
                      title="Remove collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
