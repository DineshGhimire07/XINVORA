"use client"

import * as React from "react"
import Link from "next/link"
import { SlidersHorizontal, Filter, ChevronDown, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  name: string
  hexCode?: string | null
}

interface CollectionFilterToolbarProps {
  slug: string
  totalItems: number
  colors: FilterOption[]
  sizes: FilterOption[]
  materials: FilterOption[]
  activeColor?: string
  activeSize?: string
  activeMaterial?: string
  activeSort?: string
}

export function CollectionFilterToolbar({
  slug,
  totalItems,
  colors,
  sizes,
  materials,
  activeColor,
  activeSize,
  activeMaterial,
  activeSort = "newest",
}: CollectionFilterToolbarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    sort: true,
    color: true,
    size: true,
    material: true,
  })

  // Body scroll lock when drawer is open
  React.useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDrawerOpen])

  const basePath = React.useMemo(() => {
    if (!slug || slug === "collections") return "/collections"
    if (slug.startsWith("/")) return slug
    return `/collections/${slug}`
  }, [slug])

  // Helper to construct filter URLs
  const createFilterLink = (key: string, value: string | null) => {
    const params = new URLSearchParams()

    // Sort
    const targetSort = key === "sort" ? value : activeSort
    if (targetSort && targetSort !== "newest") {
      params.set("sort", targetSort)
    }

    // Color
    const targetColor = key === "color" ? value : activeColor
    if (targetColor) {
      params.set("color", targetColor)
    }

    // Size
    const targetSize = key === "size" ? value : activeSize
    if (targetSize) {
      params.set("size", targetSize)
    }

    // Material
    const targetMaterial = key === "material" ? value : activeMaterial
    if (targetMaterial) {
      params.set("material", targetMaterial)
    }

    const query = params.toString()
    return `${basePath}${query ? `?${query}` : ""}`
  }

  const activeFilters = [
    activeColor && { key: "color", label: `Color: ${activeColor}` },
    activeSize && { key: "size", label: `Size: ${activeSize}` },
    activeMaterial && { key: "material", label: `Material: ${activeMaterial}` },
    activeSort && activeSort !== "newest" && {
      key: "sort",
      label: activeSort === "price_asc" ? "Price: Low to High" : "Price: High to Low",
    },
  ].filter(Boolean) as { key: string; label: string }[]

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <>
      {/* Top Filter Bar — single row: count | badges | filter icon */}
      <div className="relative z-30 flex items-center gap-3 py-3.5 px-4 sm:px-6 bg-surface border-y border-border/60 flex-wrap">

        {/* Product Count — always visible */}
        <span className="text-xs font-semibold tracking-wider text-text-primary uppercase shrink-0">
          {totalItems} {totalItems === 1 ? "Product" : "Products"}
        </span>

        {/* Active Filter Badges — inline, only when filters applied */}
        {activeFilters.length > 0 && (
          <>
            <span className="text-[10px] font-bold tracking-widest text-text-tertiary uppercase shrink-0">·</span>
            {activeFilters.map((filter) => (
              <Link
                key={filter.key}
                href={createFilterLink(filter.key, null)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-elevated text-text-primary text-[10px] uppercase font-medium tracking-wider border border-border rounded-full hover:border-text-primary transition-colors"
              >
                <span>{filter.label}</span>
                <X className="w-3 h-3 text-text-tertiary hover:text-text-primary stroke-[2]" />
              </Link>
            ))}
            <Link
              href={basePath}
              className="text-[10px] font-medium text-text-secondary hover:text-text-primary underline tracking-wider uppercase"
            >
              Clear All
            </Link>
          </>
        )}

        {/* Filter Icon — pushed to far right */}
        <div className="ml-auto shrink-0">
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open filter sidebar"
            className="relative p-1.5 text-text-primary hover:opacity-75 transition-opacity"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[2] text-text-primary" />
            {activeFilters.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Slide-Over Filter Sidebar Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-250"
          />

          {/* Slide Drawer Box */}
          <aside className="relative w-full max-w-md bg-background border-l border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/60 bg-surface/50">
              <div>
                <h2 className="font-display font-medium text-xl tracking-wider text-text-primary uppercase">
                  Filters & Sort
                </h2>
                <p className="text-[11px] text-text-tertiary uppercase tracking-wider mt-0.5">
                  Refine {totalItems} items
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* SORT BY SECTION */}
              <div className="border-b border-border/60 pb-6">
                <button
                  onClick={() => toggleSection("sort")}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-text-primary mb-3"
                >
                  <span>Sort By</span>
                  <ChevronDown className={cn("w-4 h-4 text-text-tertiary transition-transform duration-200", expandedSections.sort && "rotate-180")} />
                </button>

                {expandedSections.sort && (
                  <div className="space-y-1.5 pl-1">
                    {[
                      { label: "Newest Arrivals", value: "newest" },
                      { label: "Price: Low to High", value: "price_asc" },
                      { label: "Price: High to Low", value: "price_desc" },
                    ].map((option) => {
                      const isSelected = activeSort === option.value || (!activeSort && option.value === "newest")
                      return (
                        <Link
                          key={option.value}
                          href={createFilterLink("sort", option.value)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors",
                            isSelected
                              ? "bg-accent/10 text-accent font-bold border border-accent/30"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                          )}
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-accent stroke-[2.5]" />}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* COLOUR SECTION */}
              {colors.length > 0 && (
                <div className="border-b border-border/60 pb-6">
                  <button
                    onClick={() => toggleSection("color")}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-text-primary mb-3"
                  >
                    <span>Colour</span>
                    <ChevronDown className={cn("w-4 h-4 text-text-tertiary transition-transform duration-200", expandedSections.color && "rotate-180")} />
                  </button>

                  {expandedSections.color && (
                    <div className="grid grid-cols-2 gap-2 pl-1">
                      {colors.map((c) => {
                        const isSelected = activeColor === c.name
                        return (
                          <Link
                            key={c.id}
                            href={createFilterLink("color", isSelected ? null : c.name)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all border",
                              isSelected
                                ? "bg-accent/10 border-accent/40 text-accent font-semibold"
                                : "bg-surface-elevated/40 border-border/60 text-text-secondary hover:text-text-primary hover:border-border"
                            )}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              {c.hexCode && (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-border shadow-xs shrink-0"
                                  style={{ backgroundColor: c.hexCode }}
                                />
                              )}
                              <span className="truncate">{c.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-accent stroke-[2.5] shrink-0" />}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SIZE SECTION */}
              {sizes.length > 0 && (
                <div className="border-b border-border/60 pb-6">
                  <button
                    onClick={() => toggleSection("size")}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-text-primary mb-3"
                  >
                    <span>Size</span>
                    <ChevronDown className={cn("w-4 h-4 text-text-tertiary transition-transform duration-200", expandedSections.size && "rotate-180")} />
                  </button>

                  {expandedSections.size && (
                    <div className="flex flex-wrap gap-2 pl-1">
                      {sizes.map((s) => {
                        const isSelected = activeSize === s.name
                        return (
                          <Link
                            key={s.id}
                            href={createFilterLink("size", isSelected ? null : s.name)}
                            className={cn(
                              "min-w-[44px] h-10 px-3.5 flex items-center justify-center rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border",
                              isSelected
                                ? "bg-accent text-accent-foreground border-accent shadow-xs"
                                : "bg-surface-elevated/60 border-border text-text-secondary hover:text-text-primary hover:border-text-primary"
                            )}
                          >
                            {s.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MATERIAL SECTION */}
              {materials.length > 0 && (
                <div className="pb-4">
                  <button
                    onClick={() => toggleSection("material")}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-text-primary mb-3"
                  >
                    <span>Material</span>
                    <ChevronDown className={cn("w-4 h-4 text-text-tertiary transition-transform duration-200", expandedSections.material && "rotate-180")} />
                  </button>

                  {expandedSections.material && (
                    <div className="flex flex-wrap gap-2 pl-1">
                      {materials.map((m) => {
                        const isSelected = activeMaterial === m.name
                        return (
                          <Link
                            key={m.id}
                            href={createFilterLink("material", isSelected ? null : m.name)}
                            className={cn(
                              "px-3.5 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border",
                              isSelected
                                ? "bg-accent/10 border-accent/40 text-accent font-semibold"
                                : "bg-surface-elevated/40 border-border/60 text-text-secondary hover:text-text-primary hover:border-border"
                            )}
                          >
                            {m.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fixed Drawer Footer */}
            <div className="p-6 border-t border-border bg-surface flex items-center gap-3">
              <Link
                href={basePath}
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 h-12 inline-flex items-center justify-center px-4 rounded-lg border border-border text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
              >
                Clear
              </Link>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex-[2] h-12 inline-flex items-center justify-center px-6 rounded-lg bg-text-primary text-background text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                View [{totalItems}]
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
