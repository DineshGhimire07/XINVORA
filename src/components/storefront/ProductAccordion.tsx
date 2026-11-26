"use client"

import * as React from "react"

interface ProductAccordionProps {
  description?: string | null
  details?: string | null
  careGuide?: string | null
}

type TabType = "description" | "details" | "shipping" | "care"

export function ProductAccordion({ description, details, careGuide }: ProductAccordionProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>("description")
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  const tabs = [
    {
      id: "description" as const,
      label: "Description",
      content: description || "A meticulously crafted piece designed for the modern wardrobe.",
    },
    {
      id: "details" as const,
      label: "Details",
      content:
        details ||
        "Crafted with selected materials chosen for longevity and texture. Designed for modern living with structural integrity and aesthetic perfection.",
    },
    {
      id: "shipping" as const,
      label: "Shipping",
      content:
        "Complimentary standard shipping across Nepal. Orders placed before 4 PM are dispatched within 24 hours. Returns and exchanges accepted within 7 days of receipt in original condition.",
    },
    {
      id: "care" as const,
      label: "Care",
      content:
        careGuide ||
        "Handle with considered care. Dry clean or gentle hand wash in cold water. Do not tumble dry. Store in a cool, dry place away from direct sunlight.",
    },
  ]

  const activeContent = tabs.find((t) => t.id === activeTab)?.content || ""

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (isDrawerOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsDrawerOpen(false)
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = originalOverflow
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isDrawerOpen])

  return (
    <div className="flex flex-col w-full border-t border-b border-border/30 py-4 mt-2 select-none">
      {/* Horizontal Tabs Header */}
      <div className="flex flex-row items-center justify-between select-none border-b border-border/10 w-full overflow-hidden shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`text-[12px] md:text-[13px] font-bold tracking-[0.15em] uppercase cursor-pointer transition-colors duration-200 pb-3 border-b-2 -mb-[1px] whitespace-nowrap ${
                isActive
                  ? "text-text-primary border-text-primary"
                  : "text-text-secondary/70 border-transparent hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 
        In-Page Preview Viewport:
        - Clamped to 2-3 lines initially so the page does not expand downwards.
        - "YOU MAY ALSO LOVE" stays stationary right below.
      */}
      <div className="pt-3.5 flex flex-col items-start select-text">
        <div className="relative w-full">
          <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-3 whitespace-pre-line text-pretty">
            {activeContent}
          </p>
          {/* Subtle gradient fade over the 3rd line */}
          <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>

        {/* "+ See More" Trigger Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="mt-2 text-[11.5px] font-bold tracking-[0.12em] uppercase text-text-primary hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 underline underline-offset-4 cursor-pointer select-none"
        >
          <span>+ See More</span>
        </button>
      </div>

      {/* 
        Luxury Slide-Over Drawer / Bottom Sheet:
        - Floating fixed overlay that NEVER pushes "YOU MAY ALSO LOVE" or other page elements down.
        - Full description and all tab contents completely visible and scrollable.
      */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel: Slide up on mobile (bottom sheet), Slide left on desktop */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Product Information"
            className="relative z-10 w-full md:max-w-md h-[80vh] md:h-full mt-auto md:mt-0 bg-surface-elevated text-text-primary shadow-2xl flex flex-col rounded-t-2xl md:rounded-none md:rounded-l-2xl border-t md:border-t-0 md:border-l border-border/30 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/20 shrink-0">
              <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-text-primary">
                Product Information
              </span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors cursor-pointer select-none text-base"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {/* Drawer Tab Navigation */}
            <div className="flex items-center justify-between px-6 pt-3 border-b border-border/10 shrink-0 select-none overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={`drawer-${tab.id}`}
                    type="button"
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`text-[12px] font-bold tracking-[0.15em] uppercase cursor-pointer transition-colors duration-200 pb-2.5 border-b-2 -mb-[1px] whitespace-nowrap ${
                      isActive
                        ? "text-text-primary border-text-primary"
                        : "text-text-secondary/60 border-transparent hover:text-text-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Drawer Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 text-[13.5px] text-text-secondary leading-relaxed whitespace-pre-line text-pretty select-text">
              {activeContent}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-border/15 shrink-0 bg-surface/50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase bg-text-primary text-background rounded-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
