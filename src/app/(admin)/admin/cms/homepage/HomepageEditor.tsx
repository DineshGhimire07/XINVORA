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
import LookbookBlockEditor from "./LookbookBlockEditor"

interface HomepageEditorProps {
  settings?: any
  heroBlock?: any
  productGridBlock?: any
  collectionGridBlock?: any
  bannerBlocks?: any[]
  lookbookBlock?: any
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
  bannerBlocks = [],
  lookbookBlock,
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
  
  // Manage multiple custom banners as objects
  const [banners, setBanners] = useState<any[]>(() => {
    return bannerBlocks.map((b) => ({
      id: b.id,
      data: b.data || {
        imageUrl: null,
        imageMobileUrl: null,
        eyebrow: "EDITORIAL",
        title: "The Linen Edit",
        tagline: "Light. Breathable. Timeless.",
        linkText: "Shop the Edit",
        linkUrl: "/collections",
        isActive: true,
        size: "editorial"
      }
    }))
  })

  const [lookbookSlides, setLookbookSlides] = useState<any[]>(lookbookBlock?.data?.slides || [])
  const [activeTab, setActiveTab] = useState<"hero" | "arrivals" | "collections" | "banner" | "lookbook">("hero")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load initial list from settings layoutConfig and migrate dynamically
  const layoutConfig = settings?.layoutConfig as any
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const existing = layoutConfig?.sectionOrder || ["hero", "arrivals", "featured", "banner", "newsletter"]
    
    // Migrate legacy "banner" to concrete banner block ids
    const migrated: string[] = []
    existing.forEach((key: string) => {
      if (key === "banner") {
        if (banners.length > 0) {
          banners.forEach(b => migrated.push(`banner-${b.id}`))
        } else {
          migrated.push("banner")
        }
      } else {
        migrated.push(key)
      }
    })

    // Ensure all currently loaded banners are in the section order list
    banners.forEach((b) => {
      const bannerKey = `banner-${b.id}`
      if (!migrated.includes(bannerKey)) {
        const featuredIdx = migrated.indexOf("featured")
        if (featuredIdx >= 0) {
          migrated.splice(featuredIdx + 1, 0, bannerKey)
        } else {
          migrated.push(bannerKey)
        }
      }
    })

    if (!migrated.includes("lookbook")) {
      const newsletterIdx = migrated.indexOf("newsletter")
      if (newsletterIdx >= 0) {
        migrated.splice(newsletterIdx, 0, "lookbook")
      } else {
        migrated.push("lookbook")
      }
    }

    return migrated
  })

  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null)

  // Handle addition/deletion of banners dynamically updating the sectionOrder list
  const handleBannersChange = (updatedBanners: any[]) => {
    setBanners(updatedBanners)
    
    // Adjust sectionOrder list to add new banner IDs and remove deleted ones
    const bannerIds = updatedBanners.map(b => `banner-${b.id}`)
    
    // Remove any banner keys that no longer exist
    let newOrder = sectionOrder.filter((key) => {
      if (key.startsWith("banner-")) {
        return bannerIds.includes(key)
      }
      return true
    })

    // Add any new banner keys that aren't in sectionOrder yet
    bannerIds.forEach((key) => {
      if (!newOrder.includes(key)) {
        const featuredIdx = newOrder.indexOf("featured")
        if (featuredIdx >= 0) {
          newOrder.splice(featuredIdx + 1, 0, key)
        } else {
          newOrder.push(key)
        }
      }
    })

    setSectionOrder(newOrder)
  }

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
    
    // Submit all banners as a list of BannerItem structures
    formData.set("bannersData", JSON.stringify(banners))
    
    formData.set("lookbookSlides", JSON.stringify(lookbookSlides))

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
                  const getLabel = () => {
                    if (sectionId === "hero") return "Hero Carousel"
                    if (sectionId === "arrivals") return "New Arrivals"
                    if (sectionId === "featured") return "Featured Products"
                    if (sectionId === "lookbook") return "Shop the Look"
                    if (sectionId === "newsletter") return "Newsletter Section"
                    if (sectionId === "banner") return "Editorial Banner (Default)"
                    if (sectionId.startsWith("banner-")) {
                      const id = sectionId.replace("banner-", "")
                      const b = banners.find((x) => x.id === id)
                      return `Banner: ${b?.data?.title || "Untitled Banner"}`
                    }
                    return sectionId
                  }
                  const label = getLabel()

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
                Banner Modules ({banners.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("lookbook")}
                className={`pb-3 px-5 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "lookbook"
                    ? "border-text-primary text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Shop the Look
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
                  banners={banners}
                  onChange={handleBannersChange}
                />
              </div>
            )}

            {/* Shop the Look Editor (LOOKBOOK block picker) */}
            {activeTab === "lookbook" && (
              <div className="pb-4">
                <LookbookBlockEditor
                  allProducts={allProducts}
                  initialSlides={lookbookSlides}
                  onChange={setLookbookSlides}
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
