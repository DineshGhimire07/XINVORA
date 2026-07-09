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
    <div className="flex flex-col w-full border-t border-b border-border/30 py-5 mt-2">
      {/* Horizontal Tabs Header — Forced single row with horizontal scrolling on phone */}
      <div className="flex flex-row flex-nowrap items-center gap-x-6 pb-2 select-none border-b border-border/10 overflow-x-auto scrollbar-none w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`text-[12px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 pb-2 border-b-2 -mb-[9px] whitespace-nowrap ${
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
      <div className="pt-5 min-h-[80px] transition-all duration-300">
        <div className="text-[13px] text-text-secondary leading-relaxed max-w-[38rem] text-pretty animate-fade-in">
          {activeTabObj?.content}
        </div>
      </div>
    </div>
  )
}

