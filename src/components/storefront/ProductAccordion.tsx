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

  const tabs = [
    { id: "description", label: "Description", content: description || "A meticulously crafted piece designed for the modern wardrobe." },
    { id: "details", label: "Details", content: details || "Crafted with premium materials chosen for longevity and texture. Designed for modern living with structural integrity and aesthetic perfection." },
    { id: "shipping", label: "Shipping & Returns", content: "Complimentary carbon-neutral worldwide shipping on all orders. Returns accepted within 14 days of receipt in original unworn condition with all tags attached." },
    { id: "care", label: "Care Guide", content: careGuide || "Handle with considered care. Dry clean or hand wash in cold water. Do not tumble dry. Store in a cool, dry place away from direct sunlight." }
  ]

  const activeTabObj = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="flex flex-col w-full border-t border-b border-border/30 py-4 mt-2">
      {/* Horizontal Tabs Header */}
      <div className="flex items-center gap-4 border-b border-border/20 pb-2.5 overflow-x-auto scrollbar-none select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`text-[9px] font-bold tracking-[0.18em] uppercase whitespace-nowrap cursor-pointer transition-all duration-200 pb-1 -mb-[11px] border-b-2 ${
                isActive
                  ? "text-text-primary border-text-primary"
                  : "text-text-secondary border-transparent hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content Area */}
      <div className="pt-4 min-h-[70px] transition-all duration-300">
        <div className="text-[12px] text-text-secondary leading-relaxed max-w-[38rem] text-pretty animate-fade-in">
          {activeTabObj?.content}
        </div>
      </div>
    </div>
  )
}

