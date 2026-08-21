"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getAdminProductsListAction } from "@/actions/admin/products.actions"
import { attachImagesToExistingProductsAction } from "@/actions/admin/bulk-products.actions"

interface AttachToProductModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrls: string[]
  onSuccess?: (productName: string) => void
}

interface ProductItem {
  id: string
  name: string
  slug: string
  status: string
  imageCount: number
}

export function AttachToProductModal({
  isOpen,
  onClose,
  imageUrls,
  onSuccess
}: AttachToProductModalProps) {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [orderedUrls, setOrderedUrls] = useState<string[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMode, setFilterMode] = useState<"unassigned" | "all">("unassigned")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setOrderedUrls([...imageUrls])
      loadProducts()
    }
  }, [isOpen, imageUrls])

  const loadProducts = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    const res = await getAdminProductsListAction()
    if (res.success && res.data) {
      setProducts(res.data)
      if (res.data.length > 0) {
        setSelectedProductId(res.data[0].id)
      }
    } else {
      setErrorMsg(res.error || "Failed to load product inventory.")
    }
    setIsLoading(false)
  }

  const movePhoto = (index: number, direction: "left" | "right") => {
    const newUrls = [...orderedUrls]
    const targetIndex = direction === "left" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newUrls.length) return
    const temp = newUrls[index]
    newUrls[index] = newUrls[targetIndex]
    newUrls[targetIndex] = temp
    setOrderedUrls(newUrls)
  }

  if (!isOpen) return null

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (filterMode === "unassigned") return p.imageCount === 0 || p.status === "DRAFT"
    return true
  })

  const selectedProduct = products.find(p => p.id === selectedProductId)

  const handleAttach = async () => {
    if (!selectedProductId || orderedUrls.length === 0) return
    setIsSubmitting(true)
    setErrorMsg(null)

    const res = await attachImagesToExistingProductsAction([
      {
        productId: selectedProductId,
        imageUrls: orderedUrls
      }
    ])

    if (res.success) {
      setIsSubmitting(false)
      onClose()
      if (onSuccess && selectedProduct) {
        onSuccess(selectedProduct.name)
      }
    } else {
      setErrorMsg(res.error || "Failed to attach photos to product.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-admin-surface border border-admin-border w-full max-w-2xl rounded-admin-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-admin-content border-b border-admin-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-admin-lg font-bold text-admin-text-primary flex items-center gap-2">
              <span className="text-xl">➕</span>
              Attach Selected Photos to Store Product / Inventory
            </h2>
            <p className="text-admin-xs text-admin-text-secondary mt-0.5">
              Arrange photo order and select a target product from your store inventory.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-admin-md border border-admin-border flex items-center justify-center text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-surface transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-admin-xs rounded-admin-md font-medium">
              {errorMsg}
            </div>
          )}

          {/* Photo Order Arranger */}
          <div className="space-y-2 bg-admin-content/30 border border-admin-border p-4 rounded-admin-lg">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-admin-text-tertiary">
                1. Arrange Display Order ({orderedUrls.length} Photos)
              </label>
              <span className="text-[10px] text-amber-600 font-semibold">
                ★ #1 photo will be used as the Main Storefront Cover Photo
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto py-2">
              {orderedUrls.map((url, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`relative w-20 h-20 rounded-admin-md border-2 overflow-hidden bg-admin-content shadow-xs ${idx === 0 ? "border-amber-500 ring-2 ring-amber-500/30" : "border-admin-border"}`}>
                    <Image src={url} alt="Selected photo" fill className="object-cover" sizes="80px" />
                    <span className={`absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-black uppercase rounded shadow ${idx === 0 ? "bg-amber-500 text-white" : "bg-black/70 text-white"}`}>
                      {idx === 0 ? "★ #1 Cover" : `#${idx + 1}`}
                    </span>
                  </div>

                  {/* Move left / right controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePhoto(idx, "left")}
                      title="Move left (Show earlier)"
                      className="w-6 h-5 bg-admin-content border border-admin-border rounded text-[10px] flex items-center justify-center text-admin-text-primary hover:bg-admin-content-hover disabled:opacity-30 disabled:pointer-events-none"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      disabled={idx === orderedUrls.length - 1}
                      onClick={() => movePhoto(idx, "right")}
                      title="Move right (Show later)"
                      className="w-6 h-5 bg-admin-content border border-admin-border rounded text-[10px] flex items-center justify-center text-admin-text-primary hover:bg-admin-content-hover disabled:opacity-30 disabled:pointer-events-none"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Search & Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-admin-text-tertiary">
                2. Select Product Inventory Target
              </label>

              <div className="flex items-center gap-1 bg-admin-content border border-admin-border p-0.5 rounded-admin-md text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterMode("unassigned")}
                  className={`px-2.5 py-1 rounded transition-colors ${filterMode === "unassigned" ? "bg-admin-primary text-white" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  Drafts / Needs Photos
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className={`px-2.5 py-1 rounded transition-colors ${filterMode === "all" ? "bg-admin-primary text-white" : "text-admin-text-secondary hover:text-admin-text-primary"}`}
                >
                  All Inventory ({products.length})
                </button>
              </div>
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search product inventory by name or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-admin-xs bg-admin-content border border-admin-border rounded-admin-md text-admin-text-primary placeholder:text-admin-text-tertiary focus:outline-none focus:border-admin-primary transition"
              />
            </div>
          </div>

          {/* Product List */}
          <div className="space-y-1.5">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-admin-text-tertiary text-admin-xs">
                <div className="w-8 h-8 rounded-full border-2 border-admin-primary border-t-transparent animate-spin mb-2" />
                Loading product inventory...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-10 text-center text-admin-text-tertiary text-admin-xs border border-dashed border-admin-border rounded-admin-md">
                No products found. {filterMode === "unassigned" && "Try switching to 'All Inventory'."}
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-admin-border rounded-admin-lg divide-y divide-admin-border bg-admin-content/50">
                {filteredProducts.map((p) => {
                  const isSelected = p.id === selectedProductId
                  const isUnassigned = p.imageCount === 0
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? "bg-admin-primary/10 border-l-4 border-l-admin-primary" : "hover:bg-admin-content-hover/40"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-admin-primary bg-admin-primary" : "border-admin-border"}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-admin-xs font-bold text-admin-text-primary">{p.name}</p>
                          <p className="text-[10px] text-admin-text-tertiary font-mono">{p.slug}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${isUnassigned ? "bg-amber-500/10 text-amber-600 border border-amber-500/30" : "bg-gray-500/10 text-gray-500 border border-gray-500/20"}`}>
                          {isUnassigned ? "0 Photos (Needs Image)" : `✓ Has ${p.imageCount} photo(s)`}
                        </span>

                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${p.status === "PUBLISHED" ? "bg-green-500/10 text-green-600 border border-green-500/30" : "bg-amber-500/10 text-amber-600 border border-amber-500/30"}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-admin-content border-t border-admin-border px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-admin-xs font-semibold text-admin-text-secondary hover:text-admin-text-primary transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAttach}
            disabled={isSubmitting || !selectedProductId || orderedUrls.length === 0}
            className="px-6 py-2.5 bg-admin-primary text-white text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-admin-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Attaching Photos...
              </>
            ) : (
              <>
                <span>➕</span>
                Attach {orderedUrls.length} Photo{orderedUrls.length > 1 ? "s" : ""} to {selectedProduct ? `"${selectedProduct.name}"` : "Product"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
