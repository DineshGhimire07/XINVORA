"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createProductAction, updateProductAction, archiveProductAction } from "@/actions/admin/products.actions"
import { createMaterialAction } from "@/actions/admin/materials.actions"
import { createSizeAction } from "@/actions/admin/sizes.actions"
import { createCategoryAction } from "@/actions/admin/categories.actions"
import { MediaSelector } from "@/components/admin/MediaSelector"
import AdminProductPicker from "@/components/admin/AdminProductPicker"
import { cn } from "@/lib/utils"

export default function ProductEditor({
  product,
  categories,
  brands,
  mediaItems,
  collections,
  materials,
  sizes,
  allProducts,
}: {
  product?: any
  categories?: any[]
  brands?: any[]
  mediaItems?: any[]
  collections?: any[]
  materials?: any[]
  sizes?: any[]
  allProducts?: any[]
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [newMaterialName, setNewMaterialName] = useState("")
  const [isSavingMaterial, setIsSavingMaterial] = useState(false)
  const [customCategories, setCustomCategories] = useState<any[]>(categories || [])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(product?.categoryId || "")
  const [newCatName, setNewCatName] = useState("")
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const [newSizeName, setNewSizeName] = useState("")
  const [isSavingSize, setIsSavingSize] = useState(false)
  const [customSizes, setCustomSizes] = useState<any[]>(sizes || [])

  const handleAddMaterial = async () => {
    if (!newMaterialName.trim() || isSavingMaterial) return
    setIsSavingMaterial(true)
    try {
      const fd = new FormData()
      fd.append("name", newMaterialName.trim())
      const res = await createMaterialAction(fd)
      if (res.success) {
        setNewMaterialName("")
        router.refresh()
      } else {
        alert(res.error || "Failed to add material")
      }
    } catch (err: any) {
      alert(err.message || "Failed to add material")
    } finally {
      setIsSavingMaterial(false)
    }
  }
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>(product?.images || [])
  const [tryonPrompt, setTryonPrompt] = useState<string>(product?.virtualTryonPrompt || "")
  const [shortDesc, setShortDesc] = useState<string>(product?.shortDescription || "")
  const [pairedIds, setPairedIds] = useState<string[]>(product?.pairedProductIds || [])
  const [sellingPrice, setSellingPrice] = useState<string>(product?.basePrice || "")
  const [originalPrice, setOriginalPrice] = useState<string>(product?.compareAtPrice || "")

  const handleAddCategory = async () => {
    if (!newCatName.trim() || isSavingCategory) return
    setIsSavingCategory(true)
    try {
      const fd = new FormData()
      fd.append("name", newCatName.trim())
      const res = await createCategoryAction(fd)
      if (res.success && res.data) {
        const newCat = res.data
        setNewCatName("")
        setCustomCategories((prev) => {
          if (prev.some((c) => c.id === newCat.id)) return prev
          return [...prev, newCat]
        })
        setSelectedCategoryId(newCat.id)
        router.refresh()
      } else {
        alert(res.error || "Failed to add category")
      }
    } catch (err: any) {
      alert(err.message || "Failed to add category")
    } finally {
      setIsSavingCategory(false)
    }
  }

  const handleAddSize = async () => {
    if (!newSizeName.trim() || isSavingSize) return
    setIsSavingSize(true)
    try {
      const fd = new FormData()
      fd.append("name", newSizeName.trim())
      const res = await createSizeAction(fd)
      if (res.success && res.data) {
        const newSize = res.data
        setNewSizeName("")
        setCustomSizes((prev) => {
          if (prev.some((s) => s.id === newSize.id)) return prev
          return [...prev, newSize]
        })
        router.refresh()
      } else {
        alert(res.error || "Failed to add custom size")
      }
    } catch (err: any) {
      alert(err.message || "Failed to add custom size")
    } finally {
      setIsSavingSize(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSaveSuccess(false)
    setSaveProgress(10)

    // Animate progress bar while waiting
    const progressInterval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 85) { clearInterval(progressInterval); return 85 }
        return prev + Math.random() * 15
      })
    }, 200)

    const formData = new FormData(e.currentTarget)

    let result
    if (product) {
      result = await updateProductAction(product.id, formData)
    } else {
      result = await createProductAction(formData)
    }

    clearInterval(progressInterval)
    setSaveProgress(100)

    if (result.success) {
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveProgress(0)
        setSaveSuccess(false)
        if (!product) {
          router.push("/admin/products")
        } else {
          router.refresh()
        }
        setIsLoading(false)
      }, 600)
    } else {
      setSaveProgress(0)
      setError(result.error || "An unknown error occurred")
      setIsLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!product) return
    if (!confirm("Are you sure you want to archive this product?")) return

    setIsLoading(true)
    const result = await archiveProductAction(product.id)
    if (result.success) {
      router.push("/admin/products")
    } else {
      setError(result.error || "Failed to archive product")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Progress Bar ── */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${saveProgress}%`,
              background: saveSuccess
                ? "linear-gradient(90deg, #22c55e, #16a34a)"
                : "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)"
            }}
          />
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 text-green-600 text-admin-sm rounded-admin-md font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Product saved successfully!
        </div>
      )}

      {error && (
        <div className="p-4 bg-admin-status-danger-bg/25 border border-admin-status-danger-text/30 text-admin-status-danger-text text-admin-sm rounded-admin-md font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Product Name *
              </label>
              <input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
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
                defaultValue={product?.slug}
                required
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="shortDescription" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Short Description *
              </label>
              <span className={cn(
                "text-admin-xs font-mono font-bold",
                shortDesc.length < 30 || shortDesc.length > 250 ? 'text-admin-status-danger-text' : 'text-admin-text-secondary'
              )}>
                {shortDesc.length} / 250
              </span>
            </div>
            <textarea
              id="shortDescription"
              name="shortDescription"
              required
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Write a concise summary that appears near the product title, price, and purchase options on PDP (Min 30, Max 250 characters)."
              className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all h-20 resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
              Complete Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              rows={4}
              className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="categoryId" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                  Category *
                </label>
              </div>
              <select
                id="categoryId"
                name="categoryId"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong transition-colors"
              >
                <option value="" disabled>Select category</option>
                {customCategories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* ── Inline Add New Category ── */}
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCategory()
                    }
                  }}
                  placeholder="e.g. Outerwear"
                  className="flex-1 h-7 px-2.5 text-[11px] border border-admin-border rounded-admin-md bg-admin-content text-admin-text-primary placeholder:text-admin-text-tertiary focus:outline-none focus:ring-1 focus:ring-admin-primary"
                />
                <button
                  type="button"
                  disabled={isSavingCategory || !newCatName.trim()}
                  onClick={handleAddCategory}
                  className="h-7 px-2.5 text-[10px] font-semibold uppercase tracking-wider bg-admin-primary text-white rounded-admin-md hover:bg-admin-primary/90 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {isSavingCategory ? "…" : "+ Add Category"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="brandId" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Brand
              </label>
              <select
                id="brandId"
                name="brandId"
                defaultValue={product?.brandId || ""}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong transition-colors"
              >
                <option value="">No Brand</option>
                {brands?.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="badge" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                  Badge Label / Tag
                </label>
                <span className="text-[10px] text-amber-600 font-semibold uppercase">Set &quot;LIMITED EDITION&quot; to feature in /collections/limited</span>
              </div>
              <input
                id="badge"
                name="badge"
                defaultValue={product?.badge || ""}
                placeholder="e.g. LIMITED EDITION, NEW, BESTSELLER"
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-admin-text-secondary uppercase">Quick Tag:</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("badge") as HTMLInputElement
                    if (el) el.value = "LIMITED EDITION"
                  }}
                  className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[10px] font-bold uppercase rounded hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  + LIMITED EDITION
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("badge") as HTMLInputElement
                    if (el) el.value = "NEW"
                  }}
                  className="px-2 py-0.5 bg-admin-content border border-admin-border text-admin-text-primary text-[10px] font-bold uppercase rounded hover:bg-admin-content-hover transition-colors cursor-pointer"
                >
                  + NEW
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Catalog Pricing, Inventory & Status */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Pricing, Inventory & Status
          </h3>

          {(() => {
            const sellVal = parseFloat(sellingPrice)
            const origVal = parseFloat(originalPrice)
            let discountPercent = 0
            if (origVal > 0 && sellVal > 0 && origVal > sellVal) {
              discountPercent = Math.round(((origVal - sellVal) / origVal) * 100)
            }
            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="basePrice" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                    Price We Are Selling *
                  </label>
                  <input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    required
                    className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label htmlFor="compareAtPrice" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                      Original Price (Optional)
                    </label>
                    {discountPercent > 0 && (
                      <span className="text-[10px] font-bold text-admin-status-success-text bg-admin-status-success-bg px-2 py-0.5 rounded-sm">
                        -{discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <input
                    id="compareAtPrice"
                    name="compareAtPrice"
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 100.00"
                    className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="stockQuantity" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                    {product ? "Adjust Stock (+/-)" : "Stock Quantity"}
                  </label>
                  <input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    defaultValue={0}
                    required
                    className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
                  />
                  {product && <span className="text-admin-xs text-admin-text-secondary mt-0.5">Current Stock: {product.stockQuantity || 0}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="status" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                    Publish Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={product?.status || "DRAFT"}
                    className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong transition-colors"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Section 3: Sizing Stock Levels */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-admin-border pb-3">
            <h3 className="text-admin-base font-bold text-admin-text-primary">
              Clothing Sizing & Stock
            </h3>

            {/* ── Inline Add Custom Size ── */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSize()
                  }
                }}
                placeholder="e.g. Free Size (Fits XS-M) or XS-L"
                className="h-8 px-3 text-admin-sm border border-admin-border rounded-admin-md bg-admin-content text-admin-text-primary placeholder:text-admin-text-tertiary focus:outline-none focus:ring-1 focus:ring-admin-primary w-60"
              />
              <button
                type="button"
                disabled={isSavingSize || !newSizeName.trim()}
                onClick={handleAddSize}
                className="h-8 px-3 text-admin-xs font-semibold uppercase tracking-wider bg-admin-primary text-white rounded-admin-md hover:bg-admin-primary/90 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {isSavingSize ? "…" : "+ Add Size"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {customSizes?.filter(s => s.category === "CLOTHING" || s.category === "ALL" || !s.category).map((size) => (
              <div key={size.id} className="flex flex-col gap-1.5 bg-admin-content/10 border border-admin-border p-3 rounded-admin-md">
                <label htmlFor={`sizeStock_${size.id}`} className="text-admin-xs font-bold text-admin-text-primary truncate" title={size.name}>
                  Size {size.name}
                </label>
                <input
                  id={`sizeStock_${size.id}`}
                  name={`sizeStock_${size.id}`}
                  type="number"
                  defaultValue={0}
                  className="px-3 py-1.5 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-sm focus:outline-none focus:border-admin-border-strong transition-all"
                />
                {product && <span className="text-[10px] text-admin-text-secondary">Current: {product.sizeInventories?.[size.id] || 0}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Specifications (Collections & Materials) */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Categorization & Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Storefront Collections
              </label>
              <div className="max-h-40 overflow-y-auto border border-admin-border p-2 bg-admin-content rounded-admin-md divide-y divide-admin-border/50">
                {collections?.map((col) => (
                  <label key={col.id} className="flex items-center gap-2.5 p-2 text-admin-sm text-admin-text-primary cursor-pointer hover:bg-admin-content-hover/40 transition-colors">
                    <input
                      type="checkbox"
                      name="collectionIds"
                      value={col.id}
                      defaultChecked={product?.collectionIds?.includes(col.id)}
                      className="rounded border-admin-border text-admin-primary focus:ring-admin-primary"
                    />
                    {col.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Materials / Composition
              </label>
              <div className="max-h-40 overflow-y-auto border border-admin-border p-2 bg-admin-content rounded-admin-md divide-y divide-admin-border/50">
                {materials?.map((mat) => (
                  <label key={mat.id} className="flex items-center gap-2.5 p-2 text-admin-sm text-admin-text-primary cursor-pointer hover:bg-admin-content-hover/40 transition-colors">
                    <input
                      type="checkbox"
                      name="materialIds"
                      value={mat.id}
                      defaultChecked={product?.materialIds?.includes(mat.id)}
                      className="rounded border-admin-border text-admin-primary focus:ring-admin-primary"
                    />
                    {mat.name}
                  </label>
                ))}
              </div>

              {/* ── Inline Add New Material ── */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddMaterial()
                    }
                  }}
                  placeholder="e.g. Silk"
                  className="flex-1 h-8 px-3 text-admin-sm border border-admin-border rounded-admin-md bg-admin-content text-admin-text-primary placeholder:text-admin-text-tertiary focus:outline-none focus:ring-1 focus:ring-admin-primary"
                />
                <button
                  type="button"
                  disabled={isSavingMaterial || !newMaterialName.trim()}
                  onClick={handleAddMaterial}
                  className="h-8 px-3 text-admin-xs font-semibold uppercase tracking-wider bg-admin-primary text-white rounded-admin-md hover:bg-admin-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSavingMaterial ? "…" : "+ Add"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4.5: Pairing Recommendations */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Pairing Recommendations
          </h3>
          <AdminProductPicker
            allProducts={(allProducts || []).filter(p => p.id !== product?.id)}
            selectedIds={pairedIds}
            onChange={setPairedIds}
            mode="multi"
            label="Select and order paired products for 'Products in this Look'"
          />
          {pairedIds.map((pId) => (
            <input key={pId} type="hidden" name="pairedProductIds" value={pId} />
          ))}
        </div>

        {/* Section 5: Media Selector */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Product Images
          </h3>
          <MediaSelector
            mediaItems={mediaItems || []}
            selectedImages={selectedImages}
            onChange={setSelectedImages}
          />
        </div>

        {/* Section 6: accordions & AI features */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Additional Specifications & Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="details" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Specs Accordion Details
              </label>
              <textarea
                id="details"
                name="details"
                defaultValue={product?.details || ""}
                rows={3}
                placeholder="e.g. 100% Silk. Hand-crafted in traditional workshops."
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all h-24"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="careGuide" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Care Guide Details
              </label>
              <textarea
                id="careGuide"
                name="careGuide"
                defaultValue={product?.careGuide || ""}
                rows={3}
                placeholder="e.g. Dry clean only. Store in garment bags."
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all h-24"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sizeGuide" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Size Guide Description
              </label>
              <textarea
                id="sizeGuide"
                name="sizeGuide"
                defaultValue={product?.sizeGuide || ""}
                rows={3}
                placeholder="XS: Bust 82cm, Waist 64cm&#10;S: Bust 86cm, Waist 68cm"
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all h-24"
              />
            </div>
          </div>

          <div className="border-t border-admin-border pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="instagramReelUrl" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Instagram Reel URL
              </label>
              <input
                id="instagramReelUrl"
                name="instagramReelUrl"
                type="url"
                defaultValue={product?.instagramReelUrl || ""}
                placeholder="https://instagram.com/reel/..."
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="virtualTryonPrompt" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                  AI Virtual Try-On Prompt
                </label>
                <button
                  type="button"
                  onClick={() => setTryonPrompt(
                    `I am uploading two images: a photo of myself and a photo of a ${product?.name || "garment"}. Please generate a realistic image of me wearing this exact piece, keeping my face, body, and pose natural, and matching the garment's color, pattern, and fit as shown in the reference image.`
                  )}
                  className="text-admin-xs text-admin-primary hover:underline font-semibold"
                >
                  Apply Suggestion
                </button>
              </div>
              <textarea
                id="virtualTryonPrompt"
                name="virtualTryonPrompt"
                value={tryonPrompt}
                onChange={(e) => setTryonPrompt(e.target.value)}
                placeholder="AI prompt template..."
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all h-20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 7: SEO Search Settings */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-6 space-y-5 shadow-xs">
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Search Engine Optimization (SEO)
          </h3>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="seoTitle" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                SEO Meta Title
              </label>
              <input
                id="seoTitle"
                name="seoTitle"
                defaultValue={product?.seoTitle}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="seoDescription" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                SEO Meta Description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                defaultValue={product?.seoDescription}
                rows={2}
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
            </div>
          </div>
        </div>

        {/* Form controls panel */}
        <div className="flex justify-between items-center pt-4">
          {product ? (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isLoading}
              className="text-admin-status-danger-text text-admin-sm font-semibold underline hover:text-admin-status-danger-text/80 transition-colors"
            >
              Archive Product
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={isLoading}
              className="text-admin-text-secondary text-admin-sm font-semibold hover:text-admin-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden bg-admin-primary text-admin-primary-on px-6 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-admin-primary/95 transition-colors disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
