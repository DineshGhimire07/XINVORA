"use client"

import * as React from "react"

interface ProductAccordionProps {
  description?: string | null
  details?: string | null
  careGuide?: string | null
}

type TabType = "description" | "details" | "shipping" | "care"

export function ProductAccordion({ description, details, careGuide }: ProductAccordionProps) {
  // Default state: DESCRIPTION per specification
  const [activeTab, setActiveTab] = React.useState<TabType>("description")

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

  return (
    <div className="flex flex-col w-full border-t border-b border-border/30 py-4 mt-2 select-none">
      {/* Horizontal Tabs Header — Position locked outside scrollable viewport */}
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

      {/* Fixed-Height Content Viewport — Strictly locked height to guarantee zero layout shifts */}
      <div className="relative w-full h-[175px] md:h-[190px] overflow-hidden shrink-0 mt-3 select-text">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <div
              key={tab.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 overflow-y-auto pr-2 text-[13px] text-text-secondary leading-relaxed text-pretty whitespace-pre-line transition-opacity duration-200 ease-out ${
                isActive
                  ? "opacity-100 pointer-events-auto z-10 visible"
                  : "opacity-0 pointer-events-none z-0 invisible"
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
