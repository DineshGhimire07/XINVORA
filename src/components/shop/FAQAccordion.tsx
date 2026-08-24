"use client"

/**
 * components/shop/FAQAccordion.tsx — XINVORA FAQ Accordion
 *
 * Accessible, keyboard-navigable expand/collapse accordion for the FAQ page.
 * Supports single-open-at-a-time per category group.
 * Uses native HTML semantics with ARIA attributes for screen-reader compatibility.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FAQItem {
  q: string
  /** Answer can contain JSX to support links, lists, etc. */
  a: React.ReactNode
}

export interface FAQGroup {
  category: string
  items: FAQItem[]
}

interface FAQAccordionGroupProps {
  group: FAQGroup
  groupIndex: number
}

function FAQAccordionGroup({ group, groupIndex }: FAQAccordionGroupProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  const categoryId = group.category.toLowerCase().replace(/[^a-z0-9]/g, "-")

  return (
    <div
      id={categoryId}
      className="scroll-mt-32 flex flex-col gap-0"
      aria-label={`${group.category} FAQ section`}
    >
      {/* Category heading */}
      <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3 mb-1">
        {group.category}
      </h2>

      {/* Accordion items */}
      <dl className="divide-y divide-border/30">
        {group.items.map((item, idx) => {
          const isOpen = openIndex === idx
          const itemId = `faq-${groupIndex}-${idx}`
          const answerId = `${itemId}-answer`

          return (
            <div key={idx} className="py-0">
              <dt>
                <button
                  id={itemId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggle(idx)}
                  className={cn(
                    "w-full text-left flex items-start justify-between gap-4 py-4 group",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 rounded-sm",
                    "cursor-pointer transition-colors duration-150"
                  )}
                >
                  <span
                    className={cn(
                      "text-body-md font-semibold font-display leading-snug transition-colors duration-150",
                      isOpen
                        ? "text-text-primary"
                        : "text-text-primary group-hover:text-accent"
                    )}
                  >
                    {item.q}
                  </span>

                  {/* +/× indicator */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex-shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center",
                      "text-accent transition-transform duration-200",
                      isOpen && "rotate-45"
                    )}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 3v10M3 8h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
              </dt>

              {/* Collapsible answer — CSS grid trick for smooth height animation */}
              <dd
                id={answerId}
                role="region"
                aria-labelledby={itemId}
                className={cn(
                  "grid transition-all duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="text-body-sm text-text-secondary leading-relaxed text-pretty pb-5 max-w-[36rem]">
                    {item.a}
                  </div>
                </div>
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

interface FAQAccordionProps {
  groups: FAQGroup[]
}

export function FAQAccordion({ groups }: FAQAccordionProps) {
  return (
    <div className="flex flex-col gap-14">
      {groups.map((group, groupIndex) => (
        <FAQAccordionGroup
          key={group.category}
          group={group}
          groupIndex={groupIndex}
        />
      ))}
    </div>
  )
}
