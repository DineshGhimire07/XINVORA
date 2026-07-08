"use client"

import * as React from "react"

interface AccordionRowProps {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function AccordionRow({ label, children, defaultOpen = false }: AccordionRowProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div className="border-t border-border/30">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group select-none"
        aria-expanded={open}
      >
        <span className="text-[11px] font-bold tracking-[0.25em] text-text-primary uppercase">
          {label}
        </span>
        <span
          className="text-[18px] font-light text-text-secondary group-hover:text-text-primary transition-colors leading-none select-none"
          aria-hidden
        >
          {open ? "−" : "+"}
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[800px] opacity-100 pb-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-body-sm text-text-secondary leading-relaxed max-w-[38rem] text-pretty">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ProductAccordionProps {
  description?: string | null
  details?: string | null
  careGuide?: string | null
}

export function ProductAccordion({ description, details, careGuide }: ProductAccordionProps) {
  return (
    <div className="flex flex-col w-full">
      {/* DESCRIPTION */}
      <AccordionRow label="Description">
        {description || "A meticulously crafted piece designed for the modern wardrobe."}
      </AccordionRow>

      {/* DETAILS */}
      <AccordionRow label="Details">
        {details || "Crafted with premium materials chosen for longevity and texture. Designed for modern living with structural integrity and aesthetic perfection."}
      </AccordionRow>

      {/* SHIPPING & RETURNS — static site-wide */}
      <AccordionRow label="Shipping & Returns">
        Complimentary carbon-neutral worldwide shipping on all orders. Returns accepted within 14 days of receipt in original unworn condition with all tags attached. Contact us at support@xinvora.com to initiate a return.
      </AccordionRow>

      {/* CARE GUIDE */}
      <AccordionRow label="Care Guide">
        {careGuide || "Handle with considered care. Dry clean or hand wash in cold water. Do not tumble dry. Store in a cool, dry place away from direct sunlight to preserve the materials and colour."}
      </AccordionRow>

      {/* Closing border */}
      <div className="border-t border-border/30" />
    </div>
  )
}
