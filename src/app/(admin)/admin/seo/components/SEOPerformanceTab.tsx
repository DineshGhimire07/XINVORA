"use client"

import React from "react"
import { Activity, Image as ImageIcon, Zap, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"

export function SEOPerformanceTab() {
  return (
    <div className="space-y-8">
      {/* CWV Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">LCP (Largest Contentful Paint)</span>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div className="mt-3">
            <div className="text-display-xs font-display font-bold text-text-primary">1.2s</div>
            <span className="text-[10px] text-green-700 font-bold uppercase bg-green-500/10 px-2 py-0.5 rounded mt-1 inline-block">Good (&le; 2.5s)</span>
          </div>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">CLS (Cumulative Layout Shift)</span>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div className="mt-3">
            <div className="text-display-xs font-display font-bold text-text-primary">0.02</div>
            <span className="text-[10px] text-green-700 font-bold uppercase bg-green-500/10 px-2 py-0.5 rounded mt-1 inline-block">Good (&le; 0.1)</span>
          </div>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">INP (Interaction to Next Paint)</span>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div className="mt-3">
            <div className="text-display-xs font-display font-bold text-text-primary">84ms</div>
            <span className="text-[10px] text-green-700 font-bold uppercase bg-green-500/10 px-2 py-0.5 rounded mt-1 inline-block">Good (&le; 200ms)</span>
          </div>
        </Card>
      </div>

      {/* Asset Audit Section */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-4">
          <ImageIcon size={18} className="text-accent" />
          <div>
            <h3 className="text-body-md font-display font-bold text-text-primary">Largest Image Assets & Payload Optimization</h3>
            <p className="text-body-xs text-text-secondary mt-0.5">Images evaluated for modern WebP/AVIF format and width/height dimensions.</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { url: "/images/hero-journal-cover.jpg", size: "480 KB", format: "JPEG", status: "Recommend WebP" },
            { url: "/images/lookbook-autumn-2026.jpg", size: "340 KB", format: "JPEG", status: "Recommend WebP" },
            { url: "/images/collection-minimal-living.webp", size: "120 KB", format: "WebP", status: "Optimized" },
          ].map((asset, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-surface-secondary/20">
              <div className="font-mono text-xs text-text-primary">{asset.url}</div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-text-secondary">{asset.size}</span>
                <span className="text-text-secondary">{asset.format}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${asset.status === "Optimized" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                  {asset.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
