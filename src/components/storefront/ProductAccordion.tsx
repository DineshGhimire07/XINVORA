"use client"

import * as React from "react"

interface ProductAccordionProps {
  description?: string | null
  details?: string | null
  careGuide?: string | null
}

type TabType = "description" | "details" | "shipping" | "care"

export function ProductAccordion({ description, details, careGuide }: ProductAccordionProps) {
  // Start closed by default so long text does not overwhelm mobile screens
  const [activeTab, setActiveTab] = React.useState<TabType | null>(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false)

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

  const toggleTab = (tabId: TabType) => {
    setActiveTab((prev) => (prev === tabId ? null : tabId))
  }

  const activeTabObj = tabs.find((tab) => tab.id === activeTab)
  const isLongDescription = (description?.length || 0) > 280

  return (
    <div className="flex flex-col w-full border-t border-b border-border/30 py-4 mt-2">
      {/* Horizontal Tabs Header — Distributed layout, overflow hidden to prevent scroll bars */}
      <div className="flex flex-row items-center justify-between select-none border-b border-border/10 w-full overflow-hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => toggleTab(tab.id)}
              className={`text-[12px] md:text-[13px] font-bold tracking-[0.15em] uppercase cursor-pointer transition-all duration-300 pb-3 border-b-2 -mb-[1px] whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? "text-text-primary border-text-primary"
                  : "text-text-secondary/70 border-transparent hover:text-text-primary"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] transition-transform duration-200 ${isActive ? "rotate-180" : "opacity-60"}`}>
                ▾
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab Content Area — Expands when a tab is active */}
      {activeTab && activeTabObj && (
        <div className="pt-4 transition-all duration-300 ease-out">
          <div className="text-[13px] text-text-secondary leading-relaxed max-w-[38rem] text-pretty whitespace-pre-line">
            {activeTab === "description" && isLongDescription && !isDescriptionExpanded ? (
              <div>
                <p className="line-clamp-4 leading-relaxed">
                  {activeTabObj.content}
                </p>
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(true)}
                  className="mt-2.5 text-[11px] font-bold tracking-widest uppercase text-accent hover:text-text-primary transition-colors cursor-pointer inline-flex items-center gap-1 select-none"
                >
                  <span>+ Read Full Description</span>
                </button>
              </div>
            ) : (
              <div>
                <p className="leading-relaxed">{activeTabObj.content}</p>
                {activeTab === "description" && isLongDescription && isDescriptionExpanded && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded(false)}
                    className="mt-3 text-[11px] font-bold tracking-widest uppercase text-accent hover:text-text-primary transition-colors cursor-pointer inline-flex items-center gap-1 select-none"
                  >
                    <span>− Show Less</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
