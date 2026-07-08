"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProductAction, updateProductAction, archiveProductAction } from "@/actions/admin/products.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MediaSelector } from "@/components/admin/MediaSelector"

export default function ProductEditor({ product, categories, brands, mediaItems, collections, materials, sizes }: { product?: any, categories?: any[], brands?: any[], mediaItems?: any[], collections?: any[], materials?: any[], sizes?: any[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>(product?.images || [])

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
              Product Name
            </label>
            <input 
              id="name"
              name="name" 
              defaultValue={product?.name}
              required
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="slug" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Slug (URL)
            </label>
            <input 
              id="slug"
              name="slug" 
              defaultValue={product?.slug}
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
              defaultValue={product?.description}
              rows={5}
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="badge" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Badge Label <span className="normal-case font-normal opacity-60">(e.g. NEW, EDITOR'S PICK — leave empty for none)</span>
            </label>
            <input 
              id="badge"
              name="badge" 
              defaultValue={product?.badge || ""}
              placeholder="NEW"
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="details" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Details <span className="normal-case font-normal opacity-60">(composition, craftsmanship — shown in DETAILS accordion)</span>
            </label>
            <textarea 
              id="details"
              name="details" 
              defaultValue={product?.details || ""}
              rows={4}
              placeholder="e.g. 100% Silk. Hand-crafted in collaboration with traditional workshops."
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="careGuide" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Care Guide <span className="normal-case font-normal opacity-60">(shown in CARE GUIDE accordion)</span>
            </label>
            <textarea 
              id="careGuide"
              name="careGuide" 
              defaultValue={product?.careGuide || ""}
              rows={3}
              placeholder="e.g. Dry clean only. Store in a cool, dry place."
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sizeGuide" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Size Guide <span className="normal-case font-normal opacity-60">(shown in Size Guide modal on product page)</span>
            </label>
            <textarea 
              id="sizeGuide"
              name="sizeGuide" 
              defaultValue={product?.sizeGuide || ""}
              rows={4}
              placeholder="XS: Bust 82cm, Waist 64cm&#10;S: Bust 86cm, Waist 68cm&#10;M: Bust 90cm, Waist 72cm"
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
                defaultValue={product?.seoTitle}
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
              <textarea 
                id="seoDescription"
                name="seoDescription" 
                placeholder="SEO Description"
                defaultValue={product?.seoDescription}
                rows={2}
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 border-t border-border/40 pt-6 mt-2">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="categoryId" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Category *
              </label>
              <select 
                id="categoryId"
                name="categoryId" 
                defaultValue={product?.categoryId || ""}
                required
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              >
                <option value="" disabled>Select a category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="brandId" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Brand
              </label>
              <select 
                id="brandId"
                name="brandId" 
                defaultValue={product?.brandId || ""}
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              >
                <option value="">No Brand</option>
                {brands?.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 pt-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Collections
              </label>
              <div className="max-h-40 overflow-y-auto border border-border/40 p-2 bg-surface-secondary/20">
                {collections?.map((col) => (
                  <label key={col.id} className="flex items-center gap-2 p-1 text-body-sm cursor-pointer hover:bg-surface-secondary/50">
                    <input 
                      type="checkbox" 
                      name="collectionIds" 
                      value={col.id} 
                      defaultChecked={product?.collectionIds?.includes(col.id)} 
                    />
                    {col.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Materials
              </label>
              <div className="max-h-40 overflow-y-auto border border-border/40 p-2 bg-surface-secondary/20">
                {materials?.map((mat) => (
                  <label key={mat.id} className="flex items-center gap-2 p-1 text-body-sm cursor-pointer hover:bg-surface-secondary/50">
                    <input 
                      type="checkbox" 
                      name="materialIds" 
                      value={mat.id} 
                      defaultChecked={product?.materialIds?.includes(mat.id)} 
                    />
                    {mat.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border/40 pt-6 mt-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary mb-2">
              Product Images
            </label>
            <MediaSelector 
              mediaItems={mediaItems || []} 
              selectedImages={selectedImages}
              onChange={setSelectedImages}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 border-t border-border/40 pt-6 mt-2">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="basePrice" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Base Price
              </label>
              <input 
                id="basePrice"
                name="basePrice" 
                type="number"
                step="0.01"
                defaultValue={product?.basePrice}
                required
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="stockQuantity" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                {product ? "Adjust Stock (e.g. +5, -3)" : "Stock Quantity"}
              </label>
              <input 
                id="stockQuantity"
                name="stockQuantity" 
                type="number"
                defaultValue={0}
                required
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
              {product && <span className="text-[10px] text-text-tertiary">Current: {product.stockQuantity || 0}</span>}
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="status" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Status
              </label>
              <select 
                id="status"
                name="status" 
                defaultValue={product?.status || "DRAFT"}
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border/40 pt-6 mt-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary mb-2">
              Size Stock Levels
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {sizes?.filter(s => s.category === "CLOTHING" || s.category === "ALL").map((size) => (
                <div key={size.id} className="flex flex-col gap-1.5">
                  <label htmlFor={`sizeStock_${size.id}`} className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                    {product ? `Adjust ${size.name} (+/-)` : `Size ${size.name} Qty`}
                  </label>
                  <input 
                    id={`sizeStock_${size.id}`}
                    name={`sizeStock_${size.id}`}
                    type="number"
                    defaultValue={0}
                    className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
                  />
                  {product && <span className="text-[9px] text-text-tertiary">Current: {product.sizeInventories?.[size.id] || 0}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/40">
            {product ? (
              <button
                type="button"
                onClick={handleArchive}
                disabled={isLoading}
                className="text-red-600 text-body-sm underline tracking-wide hover:text-red-800 transition-colors"
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
                className="text-text-secondary text-body-sm tracking-wide hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-text-primary text-surface px-8 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors"
              >
                {isLoading ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
