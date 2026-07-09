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
    { id: "shipping", label: "Shipping", content: "Complimentary carbon-neutral worldwide shipping on all orders. Returns accepted within 14 days of receipt in original unworn condition with all tags attached." },
    { id: "care", label: "Care", content: careGuide || "Handle with considered care. Dry clean or hand wash in cold water. Do not tumble dry. Store in a cool, dry place away from direct sunlight." }
  ]

  const activeTabObj = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="flex flex-col w-full border-t border-b border-border/30 py-5 mt-2">
      {/* Horizontal Tabs Header — Distributed layout, overflow hidden to prevent scroll bars */}
      <div className="flex flex-row items-center justify-between pb-2 select-none border-b border-border/10 w-full overflow-hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`text-[12px] md:text-[14px] font-bold tracking-[0.15em] uppercase cursor-pointer transition-all duration-300 pb-2 border-b-2 -mb-[10px] whitespace-nowrap ${
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

      {/* Tab Content Area — CSS Grid layout to prevent height jumps */}
      <div className="pt-5 grid grid-cols-1 grid-rows-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <div
              key={tab.id}
              className={`col-start-1 row-start-1 text-[13px] text-text-secondary leading-relaxed max-w-[38rem] text-pretty transition-all duration-200 ease-out ${
                isActive
                  ? "opacity-100 translate-y-0 pointer-events-auto z-10"
                  : "opacity-0 translate-y-1 pointer-events-none z-0"
              }`}
            >
              {tab.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

