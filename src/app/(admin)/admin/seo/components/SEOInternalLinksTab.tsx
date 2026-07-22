"use client"

import React, { useState } from "react"
import { Link2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface SEOInternalLinksTabProps {
  suggestions?: any[]
  onInjectLink?: (suggestion: any) => void
}

export function SEOInternalLinksTab({ suggestions = [], onInjectLink }: SEOInternalLinksTabProps) {
  const [injectedIds, setInjectedIds] = useState<string[]>([])

  const mockSuggestions = suggestions.length > 0 ? suggestions : [
    { id: "1", entityName: "Aurora Silk Dress", entityType: "PRODUCT", path: "/products/aurora-silk-dress", anchorText: "Silk Dress", sourceName: "5 Ways To Wear Summer Dresses (Journal)" },
    { id: "2", entityName: "Minimalist Linen Edition", entityType: "COLLECTION", path: "/collections/linen-edition", anchorText: "Linen Edition", sourceName: "Quiet Luxury Fabrics Guide (CMS)" },
    { id: "3", entityName: "Kathmandu Atelier Story", entityType: "JOURNAL", path: "/journal/atelier-story", anchorText: "Atelier Story", sourceName: "About XINVORA Brand (CMS)" },
  ]

  const handleInject = (item: any, keyId: string) => {
    setInjectedIds([...injectedIds, keyId])
    if (onInjectLink) onInjectLink(item)
    toast.success(`Internal link injected for "${item.anchorText}" -> ${item.path}`)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-accent" />
            <h3 className="text-body-md font-display font-bold text-text-primary">Internal Linking Engine & Link Opportunities</h3>
          </div>
          <p className="text-body-xs text-text-secondary mt-0.5 max-w-2xl">
            Scans content body text for unlinked entity mentions and recommends 1-click contextual internal links to boost search topical authority.
          </p>
        </div>

        <Button className="bg-accent hover:bg-accent/90 text-white font-bold text-xs uppercase tracking-wider h-9 px-4 rounded-lg flex items-center gap-1.5 shrink-0">
          <Sparkles size={14} /> Scan Content for Opportunities
        </Button>
      </Card>

      {/* Suggestions List */}
      <Card className="rounded-xl border border-border/60 bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/40 bg-surface-secondary/30 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Detected Unlinked Mentions</span>
          <span className="text-xs text-accent font-semibold">{mockSuggestions.length} Opportunities Found</span>
        </div>

        <div className="divide-y divide-border/20">
          {mockSuggestions.map((item, idx) => {
            const keyId = item.id || item.entityId || `suggestion_${idx}_${item.entityName || "item"}`
            const isDone = injectedIds.includes(keyId)
            return (
              <div key={keyId} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-secondary/20 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded">
                      Target: {item.entityType}
                    </span>
                    <h4 className="text-body-sm font-semibold text-text-primary">{item.entityName}</h4>
                  </div>

                  <p className="text-body-xs text-text-secondary">
                    Mentioned in: <strong className="text-text-primary">{item.sourceName || item.contextSnippet || "Storefront Content"}</strong>
                  </p>

                  <div className="text-[11px] font-mono text-accent flex items-center gap-1">
                    Anchor: <span className="underline">{item.anchorText}</span> <ArrowRight size={10} /> {item.path}
                  </div>
                </div>

                <Button
                  onClick={() => handleInject(item, keyId)}
                  disabled={isDone}
                  variant={isDone ? "outline" : "primary"}
                  className={`h-8 text-xs font-bold uppercase tracking-wider shrink-0 ${
                    isDone ? "border-green-500 text-green-700 bg-green-50" : "bg-text-primary text-surface hover:bg-accent"
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 size={13} className="mr-1 text-green-600" /> Link Injected
                    </>
                  ) : (
                    "Inject Link (1-Click)"
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
