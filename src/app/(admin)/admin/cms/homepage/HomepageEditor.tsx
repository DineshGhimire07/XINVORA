"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { updateHomepageSettingsAction, createProductFromCmsAction } from "@/actions/admin/cms.actions"
import { uploadImage } from "@/lib/upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface HomepageEditorProps {
  settings?: any
  categories?: any[]
  brands?: any[]
  materials?: any[]
  collections?: any[]
}

export default function HomepageEditor({
  settings,
  categories = [],
  brands = [],
  materials = [],
  collections = []
}: HomepageEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load initial list from settings layoutConfig
  const layoutConfig = settings?.layoutConfig as any
  const initialItems = Array.isArray(layoutConfig?.newArrivals) ? layoutConfig.newArrivals : [
    {
      id: "new-1",
      name: "Lace Trim Cami Top",
      image: "/uploads/lace_cami_top_v2.png",
      slug: "lace-trim-cami-top",
    },
    {
      id: "new-2",
      name: "Pleated Linen Gown",
      image: "/uploads/pleated_linen_gown_v3.png",
      slug: "pleated-linen-gown",
    },
    {
      id: "new-3",
      name: "Tie-Shoulder Floral Dress",
      image: "/uploads/tie_shoulder_dress_v2.png",
      slug: "tie-shoulder-floral-dress",
    },
    {
      id: "new-4",
      name: "Eyelet Detail Shorts",
      image: "/uploads/eyelet_shorts_v2.png",
      slug: "eyelet-detail-shorts",
    },
    {
      id: "new-5",
      name: "Scallop Neck Halter Top",
      image: "/uploads/halter_top_v2.png",
      slug: "scallop-neck-halter-top",
    },
    {
      id: "new-6",
      name: "Floral Quilted Bralette",
      image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
      slug: "floral-quilted-bralette",
    },
    {
      id: "new-7",
      name: "Tiered A-Line Midi Skirt",
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
      slug: "tiered-a-line-midi-skirt",
    },
    {
      id: "new-8",
      name: "Embroidered Quilt Jacket",
      image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=600&auto=format&fit=crop",
      slug: "embroidered-quilt-jacket",
    },
    {
      id: "new-9",
      name: "Tiered Cotton Mini Skirt",
      image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop",
      slug: "tiered-cotton-mini-skirt",
    },
    {
      id: "new-10",
      name: "Floral Drawstring Skort",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop",
      slug: "floral-drawstring-skort",
    },
    {
      id: "new-11",
      name: "Cotton Strapless Maxi Dress",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
      slug: "cotton-strapless-maxi-dress",
    }
  ]

  const [items, setItems] = useState<any[]>(initialItems)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Product Creation Modal States
  const [showModal, setShowModal] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    description: "Considered silhouette crafted from premium natural fibres.",
    categoryId: "",
    brandId: "",
    basePrice: "12500",
    stockQuantity: "50",
    imageUrl: "",
    selectedMaterials: [] as string[],
    selectedCollections: [] as string[],
  })

  // Pre-fill categories and collections when modal opens
  useEffect(() => {
    if (categories.length > 0 && !productForm.categoryId) {
      setProductForm(prev => ({ ...prev, categoryId: categories[0].id }))
    }
    // Auto-select "New Arrivals" collection if it exists in DB lists
    const newArrivalsCol = collections.find(c => c.name.toLowerCase().includes("arrival"))
    if (newArrivalsCol) {
      setProductForm(prev => ({ ...prev, selectedCollections: [newArrivalsCol.id] }))
    }
  }, [categories, collections, showModal])

  // Sync slug with product name
  const handleNameChange = (nameVal: string) => {
    const slugVal = nameVal
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    setProductForm(prev => ({ ...prev, name: nameVal, slug: slugVal }))
  }

  // File Upload triggers details form modal (instead of direct append)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingState(true)
    setError(null)

    try {
      const url = await uploadImage(file)
      
      const cleanName = file.name
        .split(".")[0]
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase())

      const cleanSlug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")

      // Open details modal with initial info
      setProductForm(prev => ({
        ...prev,
        name: cleanName,
        slug: cleanSlug,
        imageUrl: url,
      }))
      setModalError(null)
      setShowModal(true)
    } catch (err: any) {
      setError(err.message || "Failed to upload file")
    } finally {
      setUploadingState(false)
      e.target.value = ""
    }
  }

  const [uploadingState, setUploadingState] = useState(false)

  // Save details form inside Modal
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProduct(true)
    setModalError(null)

    if (!productForm.name || !productForm.slug || !productForm.categoryId || !productForm.basePrice) {
      setModalError("Please fill out all required fields.")
      setIsSavingProduct(false)
      return
    }

    try {
      const res = await createProductFromCmsAction({
        name: productForm.name,
        slug: productForm.slug,
        description: productForm.description,
        categoryId: productForm.categoryId,
        brandId: productForm.brandId || null,
        basePrice: productForm.basePrice,
        stockQuantity: productForm.stockQuantity,
        imageUrl: productForm.imageUrl,
        collectionIds: productForm.selectedCollections,
        materialIds: productForm.selectedMaterials,
      })

      if (res.success && res.product) {
        // Prepend to local state so new uploads show up at the very first card position!
        setItems(prev => [{
          id: res.product.id,
          name: res.product.name,
          image: res.product.image,
          slug: res.product.slug,
        }, ...prev])
        setShowModal(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setModalError(res.error || "Failed to create catalog product.")
      }
    } catch (err: any) {
      setModalError(err.message || "Failed to create product.")
    } finally {
      setIsSavingProduct(false)
    }
  }

  // Optimized Real-time Drag Enter Reordering
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
  }

  // Action Buttons
  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp
    setItems(newItems)
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    // Filter and format configurations to save
    const cleanItems = items.map(({ id, name, image, slug }) => ({ id, name, image, slug }))
    const finalConfig = {
      ...layoutConfig,
      newArrivals: cleanItems
    }
    formData.set("layoutConfig", JSON.stringify(finalConfig))

    const result = await updateHomepageSettingsAction(formData)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  return (
    <>
      <Card className="rounded-none border-border-primary/40 bg-surface relative">
        <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-4">
          <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
            Homepage Layout Configurator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-body-sm border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 text-body-sm border border-green-200">
              Homepage settings updated successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* Newsletter Section */}
            <div className="flex items-center gap-4 pb-6 border-b border-border/40">
              <input 
                type="checkbox"
                id="newsletterToggle"
                name="newsletterToggle" 
                defaultChecked={settings?.newsletterToggle ?? true}
                className="w-4 h-4 text-text-primary bg-surface-secondary border-border/40 focus:ring-text-primary focus:ring-1 rounded-none"
              />
              <label htmlFor="newsletterToggle" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary cursor-pointer select-none">
                Enable Newsletter Section on Homepage
              </label>
            </div>

            {/* New Arrivals Drag-and-Drop Builder */}
            <div>
              <h3 className="text-[11px] font-bold tracking-widest uppercase text-text-primary mb-2">
                New Arrivals Editor
              </h3>
              <p className="text-body-xs text-text-secondary/70 mb-6">
                Upload garment product shots, fill in catalog/inventory details, and drag to reorder.
              </p>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Left Edit & Drag Panel */}
                <div className="xl:col-span-5 flex flex-col gap-4">
                  
                  {/* Upload Button Component */}
                  <div className="relative border-2 border-dashed border-border/60 bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-colors p-6 flex flex-col items-center justify-center text-center rounded-sm">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingState}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <span className="text-xl">↑</span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
                        {uploadingState ? "Uploading file..." : "Upload Garment Image"}
                      </span>
                      <span className="text-[9px] text-text-secondary/60">
                        Adds instantly to Inventory & Storefront
                      </span>
                    </div>
                  </div>

                  {/* Drag-and-Drop Order List */}
                  <div className="flex flex-col gap-2 max-h-[30rem] overflow-y-auto pr-2 border border-border/20 p-2 bg-surface-secondary/10">
                    {items.length === 0 ? (
                      <p className="text-body-xs text-text-secondary/50 text-center py-8">
                        No items in New Arrivals. Upload a file above.
                      </p>
                    ) : (
                      items.map((item, idx) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={handleDragOver}
                          onDragEnter={() => handleDragEnter(idx)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between p-3 border rounded-none bg-surface transition-all select-none cursor-move duration-155 ${
                            draggedIndex === idx
                              ? "opacity-30 border-text-primary/60 scale-[0.98]"
                              : "border-border/30 hover:border-border-primary/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 bg-neutral-100 flex items-center justify-center overflow-hidden border border-border/20">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="object-contain w-full h-full mix-blend-multiply p-1"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-semibold tracking-wider text-text-primary uppercase truncate max-w-[8rem]">
                                {item.name}
                              </span>
                              {item.slug && (
                                <span className="text-[8px] text-text-secondary/60 font-mono font-medium lowercase truncate max-w-[8rem]">
                                  /{item.slug}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Order Operations */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveItem(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 text-text-secondary/60 hover:text-text-primary disabled:opacity-30 disabled:hover:text-text-secondary/60"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(idx, "down")}
                              disabled={idx === items.length - 1}
                              className="p-1 text-text-secondary/60 hover:text-text-primary disabled:opacity-30 disabled:hover:text-text-secondary/60"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-1 ml-2 text-red-500 hover:text-red-700 font-semibold text-[11px]"
                              title="Delete Item"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Live Layout Preview Panel */}
                <div className="xl:col-span-7 border border-border/40 p-6 bg-[#ebe5dc] rounded-sm select-none">
                  <div className="text-[9px] uppercase tracking-widest font-bold text-text-secondary mb-4 flex justify-between items-center">
                    <span>Live Storefront Preview</span>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 px-2 py-0.5 font-normal tracking-normal">
                      Interactive Grid
                    </span>
                  </div>

                  <div className="bg-[#e6ded3] border border-border/30 p-8 select-none overflow-hidden max-h-[40rem] overflow-y-auto">
                    {/* Title Block Above Grid */}
                    <div className="flex flex-col justify-start select-none mb-8">
                      <h2 className="text-[1.85rem] font-display text-text-primary tracking-[0.18em] uppercase font-light leading-none mb-2 whitespace-nowrap">
                        New Arrivals
                      </h2>
                      <p className="text-[8px] tracking-[0.18em] text-[#555] font-semibold uppercase leading-relaxed max-w-[12rem] opacity-90">
                        Fresh pieces, thoughtfully curated.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

                      {/* Grid items rendering mock */}
                      {items.map((item) => (
                        <div 
                          key={item.id} 
                          className="relative aspect-[3/4] w-full overflow-hidden bg-transparent flex items-center justify-center border border-dashed border-border/10 group"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-contain p-0 mix-blend-multiply select-none pointer-events-none w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          
                          {/* Interactive overlay name tag on hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-start justify-end p-2 transition-opacity duration-200">
                            <span className="text-[8px] text-white tracking-wider uppercase font-semibold truncate max-w-full">
                              {item.name}
                            </span>
                            {item.slug && (
                              <span className="text-[7px] text-white/70 font-mono tracking-normal truncate max-w-full mt-0.5">
                                Link: /products/{item.slug}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-border/40">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-text-primary text-surface px-8 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors"
              >
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Product Details Modal (Overlay) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border/60 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 flex flex-col gap-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-border/20">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-primary">
                New Product Specifications
              </h4>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="text-text-secondary hover:text-text-primary font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 text-body-sm border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="flex flex-col gap-4">
              
              {/* Product Preview Thumbnail */}
              <div className="flex items-center gap-4 bg-surface-secondary/20 p-3 border border-border/10">
                <div className="relative w-16 h-20 bg-neutral-100 flex items-center justify-center border border-border/25 overflow-hidden">
                  <Image src={productForm.imageUrl} alt="Product Preview" fill className="object-contain mix-blend-multiply p-1" sizes="64px" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-bold tracking-widest uppercase text-text-secondary">Image Uploaded</span>
                  <span className="text-body-xs font-mono truncate max-w-sm text-text-primary">{productForm.imageUrl}</span>
                </div>
              </div>

              {/* Name & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="border border-border/30 px-3 py-2 text-body-sm focus:border-text-primary focus:ring-0 rounded-none bg-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.slug}
                    onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="border border-border/30 px-3 py-2 text-body-sm font-mono focus:border-text-primary focus:ring-0 rounded-none bg-surface"
                  />
                </div>
              </div>

              {/* Base Price & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                    Price (NPR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, basePrice: e.target.value }))}
                    className="border border-border/30 px-3 py-2 text-body-sm focus:border-text-primary focus:ring-0 rounded-none bg-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                    Initial Stock (Inventory) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className="border border-border/30 px-3 py-2 text-body-sm focus:border-text-primary focus:ring-0 rounded-none bg-surface"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  className="border border-border/30 px-3 py-2 text-body-sm focus:border-text-primary focus:ring-0 rounded-none bg-surface resize-none"
                />
              </div>

              {/* Category & Brand Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                    Category *
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="border border-border/30 px-3 py-2 text-body-sm focus:border-text-primary focus:ring-0 rounded-none bg-surface"
                  >
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                    Brand (Optional)
                  </label>
                  <select
                    value={productForm.brandId}
                    onChange={(e) => setProductForm(prev => ({ ...prev, brandId: e.target.value }))}
                    className="border border-border/30 px-3 py-2 text-body-sm focus:border-text-primary focus:ring-0 rounded-none bg-surface"
                  >
                    <option value="">No Brand (In-house)</option>
                    {brands.map((br: any) => (
                      <option key={br.id} value={br.id}>{br.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Materials Checkboxes */}
              {materials.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                    Materials
                  </label>
                  <div className="grid grid-cols-3 gap-2 border border-border/20 p-3 bg-surface-secondary/10 max-h-[6rem] overflow-y-auto">
                    {materials.map((mat: any) => (
                      <label key={mat.id} className="flex items-center gap-2 text-body-xs text-text-primary uppercase cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={productForm.selectedMaterials.includes(mat.id)}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setProductForm(prev => ({
                              ...prev,
                              selectedMaterials: checked
                                ? [...prev.selectedMaterials, mat.id]
                                : prev.selectedMaterials.filter(id => id !== mat.id)
                            }))
                          }}
                          className="w-3.5 h-3.5 text-text-primary bg-surface-secondary border-border/40 focus:ring-0 focus:ring-offset-0 rounded-none"
                        />
                        <span className="truncate">{mat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Collections Checkboxes */}
              {collections.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                    Target Collections
                  </label>
                  <div className="grid grid-cols-2 gap-2 border border-border/20 p-3 bg-surface-secondary/10 max-h-[6rem] overflow-y-auto">
                    {collections.map((col: any) => (
                      <label key={col.id} className="flex items-center gap-2 text-body-xs text-text-primary uppercase cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={productForm.selectedCollections.includes(col.id)}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setProductForm(prev => ({
                              ...prev,
                              selectedCollections: checked
                                ? [...prev.selectedCollections, col.id]
                                : prev.selectedCollections.filter(id => id !== col.id)
                            }))
                          }}
                          className="w-3.5 h-3.5 text-text-primary bg-surface-secondary border-border/40 focus:ring-0 focus:ring-offset-0 rounded-none"
                        />
                        <span className="truncate">{col.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 border border-border/40 text-[10px] uppercase tracking-widest font-bold hover:bg-surface-secondary/20 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isSavingProduct}
                  className="bg-text-primary text-surface px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors"
                >
                  {isSavingProduct ? "Saving Product..." : "Add to Catalog & Arrivals"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}
