"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { updateHomepageSettingsAction, createProductFromCmsAction } from "@/actions/admin/cms.actions"
import { uploadImage } from "@/lib/upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import HeroBlockEditor from "./HeroBlockEditor"
import ProductGridEditor from "./ProductGridEditor"
import CollectionGridEditor from "./CollectionGridEditor"
import BannerBlockEditor from "./BannerBlockEditor"

interface HomepageEditorProps {
  settings?: any
  heroBlock?: any
  productGridBlock?: any
  collectionGridBlock?: any
  bannerBlock?: any
  allProducts?: any[]
  activeCollections?: any[]
  categories?: any[]
  brands?: any[]
  materials?: any[]
  collections?: any[]
}

export default function HomepageEditor({
  settings,
  heroBlock,
  productGridBlock,
  collectionGridBlock,
  bannerBlock,
  allProducts = [],
  activeCollections = [],
  categories = [],
  brands = [],
  materials = [],
  collections = []
}: HomepageEditorProps) {
  const [heroSlides, setHeroSlides] = useState<any[]>(heroBlock?.data?.slides || [])
  const [productGridItems, setProductGridItems] = useState<any[]>(productGridBlock?.data?.items || [])
  const [collectionGridIds, setCollectionGridIds] = useState<string[]>(collectionGridBlock?.data?.collectionIds || [])
  const [bannerBlockData, setBannerBlockData] = useState<any>(bannerBlock?.data || null)
  const [activeTab, setActiveTab] = useState<"hero" | "arrivals" | "collections" | "banner">("hero")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load initial list from settings layoutConfig
  const layoutConfig = settings?.layoutConfig as any
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const existing = layoutConfig?.sectionOrder || ["hero", "arrivals", "featured", "newsletter"]
    if (!existing.includes("banner")) {
      const insertIdx = existing.indexOf("featured")
      if (insertIdx >= 0) {
        existing.splice(insertIdx + 1, 0, "banner")
      } else {
        existing.push("banner")
      }
    }
    return existing
  })
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const finalConfig = {
      ...layoutConfig,
      sectionOrder: sectionOrder
    }
    formData.set("layoutConfig", JSON.stringify(finalConfig))
    formData.set("heroSlides", JSON.stringify(heroSlides))
    formData.set("productGridItems", JSON.stringify(productGridItems))
    formData.set("collectionGridIds", JSON.stringify(collectionGridIds))
    if (bannerBlockData) {
      formData.set("bannerBlockData", JSON.stringify(bannerBlockData))
    }

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
            <div className="flex items-center gap-4 pb-4 border-b border-border/40">
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

            {/* Section Ordering - Top level layout setting */}
            <div className="pb-6 border-b border-border/40">
              <h3 className="text-[11px] font-bold tracking-widest uppercase text-text-primary mb-2">
                Section Rendering Order
              </h3>
              <p className="text-body-xs text-text-secondary/70 mb-4">
                Drag and drop items horizontally to change the order sections appear on the storefront.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {sectionOrder.map((sectionId, idx) => {
                  const label = 
                    sectionId === "hero" ? "Hero Carousel" :
                    sectionId === "arrivals" ? "New Arrivals" :
                    sectionId === "featured" ? "Featured Products" :
                    sectionId === "banner" ? "Editorial Banner" :
                    sectionId === "newsletter" ? "Newsletter Section" : sectionId;

                  const handleDragStartSection = (e: React.DragEvent, index: number) => {
                    setDraggedSectionIndex(index)
                    e.dataTransfer.effectAllowed = "move"
                  }

                  const handleDragEnterSection = (index: number) => {
                    if (draggedSectionIndex === null || draggedSectionIndex === index) return
                    const newOrder = [...sectionOrder]
                    const [draggedItem] = newOrder.splice(draggedSectionIndex, 1)
                    newOrder.splice(index, 0, draggedItem)
                    setDraggedSectionIndex(index)
                    setSectionOrder(newOrder)
                  }

                  const handleDragEndSection = () => {
                    setDraggedSectionIndex(null)
                  }

                  return (
                    <div
                      key={sectionId}
                      draggable
                      onDragStart={(e) => handleDragStartSection(e, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => handleDragEnterSection(idx)}
                      onDragEnd={handleDragEndSection}
                      className={`flex items-center gap-2.5 px-4 py-2 border bg-surface transition-all select-none cursor-move duration-150 rounded-sm text-[10px] font-bold tracking-wider uppercase ${
                        draggedSectionIndex === idx
                          ? "opacity-30 border-text-primary scale-[0.98]"
                          : "border-border/30 hover:border-border-primary/60 text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span className="text-text-secondary/40 font-mono text-[9px]">
                        {idx + 1}
                      </span>
                      <span>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-border/40 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setActiveTab("hero")}
                className={`pb-3 px-5 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "hero"
                    ? "border-text-primary text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Hero Carousel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("arrivals")}
                className={`pb-3 px-5 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "arrivals"
                    ? "border-text-primary text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                New Arrivals Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("collections")}
                className={`pb-3 px-5 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "collections"
                    ? "border-text-primary text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Featured Collections
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("banner")}
                className={`pb-3 px-5 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "banner"
                    ? "border-text-primary text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Editorial Banner
              </button>
            </div>

            {/* Hero Carousel Editor */}
            {activeTab === "hero" && (
              <div className="pb-4">
                <HeroBlockEditor initialSlides={heroSlides} onChange={setHeroSlides} />
              </div>
            )}

            {/* New Arrivals Editor (PRODUCT_GRID block picker) */}
            {activeTab === "arrivals" && (
              <div className="pb-4">
                <ProductGridEditor
                  allProducts={allProducts}
                  initialItems={productGridItems}
                  onChange={setProductGridItems}
                />
              </div>
            )}

            {/* Featured Collections Editor (COLLECTION_GRID block picker) */}
            {activeTab === "collections" && (
              <div className="pb-4">
                <CollectionGridEditor
                  allCollections={activeCollections}
                  initialCollectionIds={collectionGridIds}
                  onChange={setCollectionGridIds}
                />
              </div>
            )}

            {/* Editorial Banner Editor (BANNER block picker) */}
            {activeTab === "banner" && (
              <div className="pb-4">
                <BannerBlockEditor
                  initialData={bannerBlockData}
                  onChange={setBannerBlockData}
                />
              </div>
            )}

            <div className="flex justify-end mt-8 pt-6 border-t border-border/40">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-text-primary text-surface px-8 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors cursor-pointer"
              >
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
