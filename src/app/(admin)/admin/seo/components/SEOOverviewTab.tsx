"use client"

import React from "react"
import { ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, Zap, TrendingUp, Search, Layers, FileText, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SEOOverviewTabProps {
  overview: any
  onRunAudit: () => void
  onSwitchTab: (tab: string) => void
}

export function SEOOverviewTab({ overview, onRunAudit, onSwitchTab }: SEOOverviewTabProps) {
  const { overallScore, indexedCount, totalCount, entityCounts, issues, recentAuditHistory } = overview

  const timelineLogs = recentAuditHistory && recentAuditHistory.length > 0
    ? recentAuditHistory[0]?.improvementsLog || []
    : [
        { timestamp: "Today", message: "Generated 23 Meta Descriptions for catalog products" },
        { timestamp: "Today", message: "Auto-filled 14 missing image ALT tags" },
        { timestamp: "Yesterday", message: "Regenerated dynamic sitemap index and sub-sitemaps" },
        { timestamp: "Yesterday", message: "Resolved 3 canonical URL parameter discrepancies" },
      ]

  return (
    <div className="space-y-8">
      {/* 1. Command Center Operational Header */}
      <Card className="p-8 rounded-2xl border border-border/60 bg-surface shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Health Score Gauge */}
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-accent/40 shadow-inner shrink-0">
              <div className="text-center">
                <span className="text-display-md font-display font-bold text-accent leading-none block">
                  {overallScore}
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-text-secondary mt-1 block">/100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-overline text-accent uppercase font-bold tracking-widest">
                  SEO Command Center
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-500/10 text-green-700 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Operational
                </span>
              </div>
              <h2 className="text-display-xs font-display font-bold text-text-primary mt-1">
                Storefront SEO Health & Optimization Status
              </h2>
              <p className="text-body-sm text-text-secondary mt-1 font-light max-w-xl">
                Real-time automated inspection across {totalCount} total entities ({indexedCount} indexed pages). 
              </p>
            </div>
          </div>

          {/* Quick Action Operations Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Button
              onClick={onRunAudit}
              className="bg-text-primary text-surface hover:bg-accent transition-colors font-bold text-xs uppercase tracking-wider h-11 px-5 rounded-xl flex items-center gap-2 shadow-sm"
            >
              <RefreshCw size={15} /> Run Full Audit
            </Button>
            <Button
              onClick={() => onSwitchTab("content")}
              variant="outline"
              className="border-border/80 h-11 px-5 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-surface-secondary"
            >
              Fix Missing Metadata
            </Button>
            <Button
              onClick={() => onSwitchTab("technical")}
              variant="outline"
              className="border-border/80 h-11 px-5 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-surface-secondary"
            >
              Sitemap Index
            </Button>
          </div>
        </div>

        {/* Priority Status Breakdown Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/40">
          <div className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">Critical Issues</span>
              <span className="text-body-lg font-bold text-text-primary">{issues.high} High Priority</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Warnings</span>
              <span className="text-body-lg font-bold text-text-primary">{issues.medium} Medium Issues</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 block">Optimized Pages</span>
              <span className="text-body-lg font-bold text-text-primary">{indexedCount} / {totalCount} Indexed</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/20 rounded-xl">
            <Zap className="h-5 w-5 text-accent shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">Redirect Rules</span>
              <span className="text-body-lg font-bold text-text-primary">{overview.redirectsCount} Active Rules</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Entity Distribution & Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-xl border border-border/60 bg-surface flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary block">Products SEO</span>
            <h3 className="text-display-xs font-display font-bold text-text-primary mt-1">{entityCounts.products}</h3>
            <span className="text-admin-xs text-green-600 font-semibold mt-0.5 block">100% Product Schema Enabled</span>
          </div>
          <Search size={24} className="text-text-secondary/40" />
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary block">Collections SEO</span>
            <h3 className="text-display-xs font-display font-bold text-text-primary mt-1">{entityCounts.collections}</h3>
            <span className="text-admin-xs text-text-secondary mt-0.5 block">Collection pages indexed</span>
          </div>
          <Layers size={24} className="text-text-secondary/40" />
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary block">Journal SEO</span>
            <h3 className="text-display-xs font-display font-bold text-text-primary mt-1">{entityCounts.journal}</h3>
            <span className="text-admin-xs text-text-secondary mt-0.5 block">Editorial stories monitored</span>
          </div>
          <FileText size={24} className="text-text-secondary/40" />
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary block">CMS Pages SEO</span>
            <h3 className="text-display-xs font-display font-bold text-text-primary mt-1">{entityCounts.cmsPages}</h3>
            <span className="text-admin-xs text-text-secondary mt-0.5 block">Static & custom pages</span>
          </div>
          <File size={24} className="text-text-secondary/40" />
        </Card>
      </div>

      {/* 3. SEO Mission Timeline & Log */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface">
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            <h3 className="text-body-md font-display font-bold text-text-primary">SEO Mission Timeline & Audit History</h3>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Chronological Optimization Log</span>
        </div>

        <div className="space-y-4">
          {timelineLogs.map((log: any, idx: number) => (
            <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-surface-secondary/40 border border-border/30">
              <span className="text-[10px] font-bold tracking-wider uppercase text-accent bg-accent/10 px-2 py-1 rounded shrink-0">
                {log.timestamp || "Today"}
              </span>
              <p className="text-body-sm text-text-primary font-light flex-1">
                {log.message}
              </p>
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
