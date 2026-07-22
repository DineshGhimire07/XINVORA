"use client"

import React from "react"
import { GitCommit, AlertCircle, CheckCircle2, Layers } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SEOCrawlGraphTabProps {
  graphData?: any
}

export function SEOCrawlGraphTab({ graphData }: SEOCrawlGraphTabProps) {
  const totalNodes = graphData?.totalNodes || 42
  const orphanCount = graphData?.orphanNodesCount || 2
  const orphanNodes = graphData?.orphanNodes || [
    { id: "o1", name: "Limited Silk Foulard", entityType: "PRODUCT", path: "/products/silk-foulard", inboundLinksCount: 0 },
    { id: "o2", name: "Autumn Capsule Lookbook", entityType: "LOOKBOOK", path: "/lookbook/autumn-capsule", inboundLinksCount: 0 },
  ]

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Total Graph Nodes</span>
            <GitCommit className="h-5 w-5 text-accent" />
          </div>
          <div className="text-display-xs font-display font-bold text-text-primary mt-2">{totalNodes} Pages</div>
          <span className="text-admin-xs text-text-secondary mt-1 block">Internal link structure nodes</span>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Orphan Pages Flagged</span>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-display-xs font-display font-bold text-amber-600 mt-2">{orphanCount} Orphans</div>
          <span className="text-admin-xs text-amber-700 font-semibold mt-1 block">0 inbound internal links</span>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Average Link Depth</span>
            <Layers className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-display-xs font-display font-bold text-text-primary mt-2">1.8 Clicks</div>
          <span className="text-admin-xs text-green-700 font-semibold mt-1 block">Optimal search crawl depth</span>
        </Card>
      </div>

      {/* Crawl Tree Visualizer */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h3 className="text-body-md font-display font-bold text-text-primary">Internal Link Depth Visualizer</h3>
            <p className="text-body-xs text-text-secondary mt-0.5">Hierarchical link depth distribution from homepage root.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-surface-secondary/40 border border-border/40 font-mono text-xs space-y-3">
            <div className="flex items-center gap-2 text-accent font-bold">
              <span>ROOT [/]</span> &bull; Level 0 (Homepage)
            </div>

            <div className="pl-6 border-l-2 border-accent/40 space-y-2">
              <div className="text-text-primary font-semibold">├─ [/collections/all] (Level 1 &bull; 18 Outbound Links)</div>
              <div className="pl-6 border-l-2 border-accent/20 space-y-1 text-text-secondary">
                <div>├─ [/products/linen-shirt] (Level 2 &bull; 4 Inbound Links)</div>
                <div>├─ [/products/cashmere-sweater] (Level 2 &bull; 6 Inbound Links)</div>
              </div>

              <div className="text-text-primary font-semibold mt-2">├─ [/journal] (Level 1 &bull; 12 Outbound Links)</div>
              <div className="pl-6 border-l-2 border-accent/20 space-y-1 text-text-secondary">
                <div>└─ [/journal/atelier-story] (Level 2 &bull; 3 Inbound Links)</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Orphan Pages Table */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500" />
            <h3 className="text-body-md font-display font-bold text-text-primary">Detected Orphan Pages (0 Inbound Links)</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded">
            Requires Internal Link Insertion
          </span>
        </div>

        <div className="space-y-3">
          {orphanNodes.map((node: any) => (
            <div key={node.id} className="flex items-center justify-between p-3 border border-amber-500/30 rounded-lg bg-amber-500/5 text-xs">
              <div>
                <div className="font-semibold text-text-primary">{node.name}</div>
                <div className="font-mono text-[11px] text-text-secondary mt-0.5">{node.path}</div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-surface px-2 py-1 rounded border border-border/40">
                  0 Inbound Links
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
