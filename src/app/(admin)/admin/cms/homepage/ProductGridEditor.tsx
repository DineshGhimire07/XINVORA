"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2, GripVertical } from "lucide-react"
import { uploadImage } from "@/lib/upload"

interface ProductGridEditorProps {
  allProducts: any[] // published products list: { id, name, slug, productImages: { url }[] }
  initialItems: { productId: string; customImageUrl?: string | null }[]
  onChange: (items: { productId: string; customImageUrl?: string | null }[]) => void
}

export default function ProductGridEditor({
  allProducts = [],
  initialItems = [],
  onChange,
}: ProductGridEditorProps) {
  const [items, setItems] = useState<{ productId: string; customImageUrl?: string | null }[]>(initialItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const updateSelection = (newItems: typeof items) => {
    setItems(newItems)
    onChange(newItems)
  }

  const handleAddProduct = (id: string) => {
    if (items.some((item) => item.productId === id)) return
    if (items.length >= 10) {
      alert("You can select a maximum of 10 products for the storefront arrivals grid.")
      return
    }
    updateSelection([...items, { productId: id, customImageUrl: null }])
  }

  const handleRemoveProduct = (id: string) => {
    updateSelection(items.filter((item) => item.productId !== id))
  }

  const handleImageUpload = async (productId: string, file: File) => {
    setUploadingId(productId)
    try {
      const url = await uploadImage(file)
      updateSelection(
        items.map((item) =>
          item.productId === productId ? { ...item, customImageUrl: url } : item
        )
      )
    } catch (err) {
      console.error("Failed to upload custom image:", err)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploadingId(null)
    }
  }

  const handleClearCustomImage = (productId: string) => {
    updateSelection(
      items.map((item) =>
        item.productId === productId ? { ...item, customImageUrl: null } : item
      )
    )
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
    const newItems = [...items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)
    setDraggedIndex(index)
    setItems(newItems)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    onChange(items)
  }

  const selectedIds = items.map((i) => i.productId)

  // Filter products for the picker list
  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const notSelected = !selectedIds.includes(p.id)
    return matchesSearch && notSelected
  })

  // Map selected IDs back to product details
  const selectedProducts = items
    .map((item) => {
      const p = allProducts.find((prod) => prod.id === item.productId)
      if (!p) return null
      return {
        ...p,
        customImageUrl: item.customImageUrl,
      }
    })
    .filter(Boolean) as any[]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-text-primary">
          Arrivals Grid Picker
        </h3>
        <p className="text-body-xs text-text-secondary/70 mt-1">
          Select and arrange up to 10 products. These will render live on the storefront arrivals section.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Search & Pick list */}
        <div className="lg:col-span-5 space-y-4">
          <Label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
            Search Catalog
          </Label>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products to add..."
              className="pl-10 h-10 rounded-none bg-surface border-border/30 text-body-sm"
            />
          </div>

          <div className="max-h-80 overflow-y-auto border border-border/20 p-2 bg-surface-secondary/10 divide-y divide-border/20">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const imageUrl = p.productImages?.[0]?.url
                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddProduct(p.id)}
                    className="flex items-center justify-between p-2.5 hover:bg-surface-secondary/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-11 bg-neutral-100 border border-border/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          <img src={imageUrl} alt={p.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="text-[7px] uppercase font-bold text-text-secondary">No Image</div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold tracking-wider text-text-primary uppercase truncate max-w-[12rem] group-hover:text-text-primary transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[8px] text-text-secondary/60 font-mono mt-0.5">{p.slug}</span>
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
                {searchQuery ? "No products match search." : "No more products available to pick."}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Reorder grid list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
              Selected Grid Order
            </Label>
            <span className="text-[9px] tracking-widest uppercase font-bold text-text-secondary/60 bg-surface-secondary/50 px-2 py-0.5 border border-border/30">
              {items.length} / 10 selected
            </span>
          </div>

          <div className="space-y-2 border border-border/20 p-3 bg-surface-secondary/10 max-h-[26rem] overflow-y-auto">
            {selectedProducts.length === 0 ? (
              <div className="p-12 text-center text-body-xs text-text-secondary/60 italic">
                No products selected yet. Search and pick on the left.
              </div>
            ) : (
              selectedProducts.map((p: any, idx) => {
                const isDragging = draggedIndex === idx
                const item = items.find((itm) => itm.productId === p.id)
                const displayImageUrl = item?.customImageUrl || p.productImages?.[0]?.url

                return (
                  <div
                    key={p.id}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(idx)}
                    className={`flex flex-col md:flex-row md:items-center justify-between p-3 border bg-surface transition-all select-none duration-150 gap-4 ${
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
                      <div className="relative w-8 h-10 bg-neutral-100 border border-border/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {displayImageUrl ? (
                          <img src={displayImageUrl} alt={p.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="text-[7px] uppercase font-bold text-text-secondary">No Image</div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider text-text-primary uppercase truncate max-w-[12rem]">
                          {p.name}
                        </span>
                        <span className="text-[8px] text-text-secondary/60 font-mono mt-0.5">{p.slug}</span>
                        {item?.customImageUrl && (
                          <span className="text-[7px] text-accent font-bold tracking-wider uppercase mt-0.5">
                            Custom Image Override
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Custom Image Upload & Clear */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-neutral-50 hover:bg-neutral-100 border border-border/40 text-[8px] uppercase tracking-widest font-bold px-2.5 py-1.5 transition-colors">
                          {uploadingId === p.id ? "Uploading..." : item?.customImageUrl ? "Change Override" : "Custom Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingId === p.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(p.id, file)
                            }}
                          />
                        </label>
                        {item?.customImageUrl && (
                          <button
                            type="button"
                            onClick={() => handleClearCustomImage(p.id)}
                            className="text-[8px] text-red-500 hover:text-red-700 uppercase tracking-widest font-bold underline px-1"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(p.id)}
                        className="text-text-secondary/60 hover:text-red-500 transition-colors p-1"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
