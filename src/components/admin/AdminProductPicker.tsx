"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2, GripVertical, Check } from "lucide-react"

interface ProductItem {
  id: string
  name: string
  slug: string
  productImages?: { url: string }[]
}

interface AdminProductPickerProps {
  allProducts: ProductItem[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  mode?: "single" | "multi"
  label?: string
  maxItems?: number
}

export default function AdminProductPicker({
  allProducts = [],
  selectedIds = [],
  onChange,
  mode = "multi",
  label = "Select Products",
  maxItems = 20,
}: AdminProductPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleSelectProduct = (id: string) => {
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

  const handleRemoveProduct = (id: string) => {
    onChange(selectedIds.filter((x) => x !== id))
  }

  // --- Drag and Drop for Multi-select ---
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

  // Filter available options
  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const notSelected = mode === "single" ? true : !selectedIds.includes(p.id)
    return matchesSearch && notSelected
  })

  // Map selected IDs back to product details
  const selectedProducts = selectedIds
    .map((id) => allProducts.find((prod) => prod.id === id))
    .filter(Boolean) as ProductItem[]

  return (
    <div className="space-y-4">
      {label && (
        <Label className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider block">
          {label}
        </Label>
      )}

      {mode === "single" ? (
        // --- Single Select Layout ---
        <div className="space-y-3">
          {selectedProducts.length > 0 ? (
            <div className="flex items-center justify-between p-3 border border-admin-border bg-admin-surface rounded-admin-md">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-10 bg-neutral-100 border border-admin-border/50 rounded-xs flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {selectedProducts[0].productImages?.[0]?.url ? (
                    <img
                      src={selectedProducts[0].productImages[0].url}
                      alt={selectedProducts[0].name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-[7px] uppercase font-bold text-admin-text-secondary">No Image</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-admin-sm font-semibold text-admin-text-primary uppercase truncate max-w-[15rem]">
                    {selectedProducts[0].name}
                  </span>
                  <span className="text-admin-xs text-admin-text-secondary/70 font-mono">
                    {selectedProducts[0].slug}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-admin-xs text-red-500 hover:text-red-700 font-semibold uppercase tracking-wider"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search and select linked product..."
                className="pl-10 h-10 rounded-admin-md bg-admin-content border-admin-border text-admin-sm focus:ring-admin-primary"
              />
              {searchQuery && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto border border-admin-border bg-admin-surface rounded-admin-md shadow-lg divide-y divide-admin-border/30">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => {
                      const imageUrl = p.productImages?.[0]?.url
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p.id)}
                          className="flex items-center gap-3 p-2.5 hover:bg-admin-content-hover/40 transition-colors cursor-pointer"
                        >
                          <div className="relative w-7 h-9 bg-neutral-100 border border-admin-border/50 rounded-xs flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {imageUrl ? (
                              <img src={imageUrl} alt={p.name} className="object-cover w-full h-full" />
                            ) : (
                              <div className="text-[6px] uppercase font-bold text-admin-text-secondary">No Image</div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-admin-xs font-semibold text-admin-text-primary uppercase">
                              {p.name}
                            </span>
                            <span className="text-[9px] text-admin-text-secondary/60 font-mono">
                              {p.slug}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-3.5 text-center text-admin-xs text-admin-text-secondary/60 italic">
                      No matching products.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // --- Multi Select Layout ---
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Product Search Box */}
          <div className="md:col-span-5 space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products to add..."
                className="pl-10 h-10 rounded-admin-md bg-admin-content border-admin-border text-admin-sm focus:ring-admin-primary"
              />
            </div>
            <div className="max-h-64 overflow-y-auto border border-admin-border p-1.5 bg-admin-content/20 rounded-admin-md divide-y divide-admin-border/30">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const imageUrl = p.productImages?.[0]?.url
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p.id)}
                      className="flex items-center justify-between p-2 hover:bg-admin-content-hover/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-7 h-9 bg-neutral-100 border border-admin-border/50 rounded-xs flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={p.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="text-[6px] uppercase font-bold text-admin-text-secondary">No Image</div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-admin-xs font-semibold text-admin-text-primary uppercase truncate max-w-[10rem]">
                            {p.name}
                          </span>
                          <span className="text-[9px] text-admin-text-secondary/60 font-mono mt-0.5">
                            {p.slug}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="h-6 w-6 flex items-center justify-center border border-admin-border bg-admin-surface text-admin-text-primary hover:bg-admin-primary hover:text-white transition-colors rounded-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-admin-xs text-admin-text-secondary/50 italic">
                  {searchQuery ? "No products match search." : "No more products available."}
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected items list with order control */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-admin-text-secondary">
                Selected Pairings ({selectedProducts.length})
              </span>
              <span className="text-[9px] font-mono text-admin-text-secondary/70 bg-admin-content border border-admin-border/50 px-2 py-0.5 rounded-sm">
                Drag to Reorder
              </span>
            </div>

            <div className="space-y-2 border border-admin-border/40 p-2.5 bg-admin-content/20 rounded-admin-lg max-h-64 overflow-y-auto">
              {selectedProducts.length === 0 ? (
                <div className="p-12 text-center text-admin-xs text-admin-text-secondary/50 italic">
                  No pairings configured. Use the search to add products.
                </div>
              ) : (
                selectedProducts.map((p, idx) => {
                  const isDragging = draggedIndex === idx
                  const imageUrl = p.productImages?.[0]?.url

                  return (
                    <div
                      key={p.id}
                      onDragOver={handleDragOver}
                      onDragEnter={() => handleDragEnter(idx)}
                      className={`flex items-center justify-between p-2.5 border bg-admin-surface rounded-admin-md transition-all select-none duration-150 gap-3 ${
                        isDragging
                          ? "opacity-30 border-admin-primary scale-[0.99]"
                          : "border-admin-border/40 hover:border-admin-border"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Drag Handle */}
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab active:cursor-grabbing text-admin-text-secondary/30 hover:text-admin-text-primary p-1 transition-colors flex-shrink-0"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-7 h-9 bg-neutral-100 border border-admin-border/50 rounded-xs flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={p.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="text-[6px] uppercase font-bold text-admin-text-secondary">No Image</div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-admin-xs font-bold text-admin-text-primary uppercase truncate max-w-[12rem]">
                            {p.name}
                          </span>
                          <span className="text-[9px] text-admin-text-secondary/60 font-mono truncate">
                            {p.slug}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(p.id)}
                        className="text-admin-text-secondary/50 hover:text-red-500 transition-colors p-1"
                        title="Remove pairing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
