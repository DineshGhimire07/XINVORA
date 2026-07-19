"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProductAction, updateProductAction, archiveProductAction } from "@/actions/admin/products.actions"
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
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>(product?.images || [])
  const [tryonPrompt, setTryonPrompt] = useState<string>(product?.virtualTryonPrompt || "")
  const [shortDesc, setShortDesc] = useState<string>(product?.shortDescription || "")
  const [pairedIds, setPairedIds] = useState<string[]>(product?.pairedProductIds || [])
  const [sellingPrice, setSellingPrice] = useState<string>(product?.basePrice || "")
  const [originalPrice, setOriginalPrice] = useState<string>(product?.compareAtPrice || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    let result
    if (product) {
      result = await updateProductAction(product.id, formData)
    } else {
      result = await createProductAction(formData)
    }

    if (result.success) {
      router.push("/admin/products")
    } else {
      setError(result.error || "An unknown error occurred")
    }
    setIsLoading(false)
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
              <label htmlFor="categoryId" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={product?.categoryId || ""}
                required
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong transition-colors"
              >
                <option value="" disabled>Select category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
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
              <label htmlFor="badge" className="text-admin-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Badge Label
              </label>
              <input
                id="badge"
                name="badge"
                defaultValue={product?.badge || ""}
                placeholder="e.g. NEW, EDITORS PICK"
                className="px-3.5 py-2 bg-admin-content border border-admin-border text-admin-text-primary text-admin-sm rounded-admin-md focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
              />
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
          <h3 className="text-admin-base font-bold text-admin-text-primary border-b border-admin-border pb-3">
            Clothing Sizing & Stock
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {sizes?.filter(s => s.category === "CLOTHING" || s.category === "ALL").map((size) => (
              <div key={size.id} className="flex flex-col gap-1.5 bg-admin-content/10 border border-admin-border p-3 rounded-admin-md">
                <label htmlFor={`sizeStock_${size.id}`} className="text-admin-xs font-bold text-admin-text-primary">
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
              className="bg-admin-primary text-admin-primary-on px-6 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md hover:bg-admin-primary/95 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
