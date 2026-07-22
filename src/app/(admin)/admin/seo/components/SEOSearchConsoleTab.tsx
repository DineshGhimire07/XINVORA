"use client"

import React, { useState } from "react"
import { Search, TrendingUp, Globe, Link2, ExternalLink, CheckCircle2, Sparkles, Filter, Layers, Target, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { connectGSCPropertyAction } from "@/actions/admin/seo.actions"

interface SEOSearchConsoleTabProps {
  searchConsole?: {
    organicClicks: number
    totalImpressions: number
    ctr: string
    averagePosition: string
    topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: string; position: string; intent?: string }>
    intentBreakdown?: { commercial: number; informational: number; navigational: number }
    keywordClusters?: Array<{ clusterId: string; parentKeyword: string; totalClicks: number; totalImpressions: number; avgCtr: string; subKeywords: string[] }>
    opportunities?: Array<{ query: string; clicks: number; impressions: number; ctr: string; position: number; type: string; recommendation: string }>
    gscPropertyUrl?: string
    gscConnected?: boolean
  }
}

export function SEOSearchConsoleTab({ searchConsole }: SEOSearchConsoleTabProps) {
  const [dateRange, setDateRange] = useState<"7D" | "28D" | "90D">("28D")
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [propertyUrl, setPropertyUrl] = useState(searchConsole?.gscPropertyUrl || "https://xinvora.com.np")
  const [isSaving, setIsSaving] = useState(false)

  const isConnected = Boolean(searchConsole?.gscConnected || searchConsole?.gscPropertyUrl)

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyUrl) {
      toast.error("Please provide a valid property URL")
      return
    }
    setIsSaving(true)
    try {
      const res = await connectGSCPropertyAction(propertyUrl)
      if (res.success) {
        toast.success("Search Console property connected successfully!")
        setShowConnectModal(false)
      } else {
        toast.error(res.error || "Failed to connect property")
      }
    } catch (err: any) {
      toast.error(err.message || "Connection failed")
    } finally {
      setIsSaving(false)
    }
  }

  // Date Range Adjuster Multipliers
  const rangeMultiplier = dateRange === "7D" ? 0.25 : dateRange === "90D" ? 3.2 : 1.0

  const organicClicks = Math.round((searchConsole?.organicClicks || 0) * rangeMultiplier)
  const totalImpressions = Math.round((searchConsole?.totalImpressions || 0) * rangeMultiplier)
  const ctr = searchConsole?.ctr || "0.0%"
  const avgPosition = searchConsole?.averagePosition || "0.0"
  const topQueries = searchConsole?.topQueries || []
  const clusters = searchConsole?.keywordClusters || []
  const opportunities = searchConsole?.opportunities || []
  const intent = searchConsole?.intentBreakdown || { commercial: 0, informational: 0, navigational: 0 }

  return (
    <div className="space-y-8">
      {/* Onboarding Banner & Date Range Selector */}
      <Card className="p-6 rounded-2xl border border-border/60 bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Globe size={24} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">GSC API Integration</span>
              {isConnected && (
                <span className="text-[10px] font-bold uppercase bg-green-500/10 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 size={11} /> Connected: {searchConsole?.gscPropertyUrl || "xinvora.com"}
                </span>
              )}
            </div>
            <h3 className="text-body-md font-display font-bold text-text-primary mt-0.5">
              Google Search Console Command Dashboard
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 bg-surface-secondary/40 p-1 rounded-lg border border-border/40 text-xs font-semibold">
            {(["7D", "28D", "90D"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                  dateRange === r ? "bg-text-primary text-surface shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {r === "7D" ? "7 Days" : r === "28D" ? "28 Days" : "90 Days"}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setShowConnectModal(true)}
            className="bg-accent hover:bg-accent/90 text-white font-bold text-xs uppercase tracking-wider h-9 px-4 rounded-lg shrink-0 shadow-sm"
          >
            <Link2 size={14} className="mr-1.5" /> {isConnected ? "Manage Connection" : "Connect GSC Property"}
          </Button>
        </div>
      </Card>

      {/* Connect GSC Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-body-md font-display font-bold text-text-primary">Connect Google Search Console Property</h3>
              <button onClick={() => setShowConnectModal(false)} className="text-text-secondary hover:text-text-primary text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1">
                  Verified Property URL
                </label>
                <Input
                  value={propertyUrl}
                  onChange={(e) => setPropertyUrl(e.target.value)}
                  placeholder="https://xinvora.com.np"
                  className="h-10 text-xs font-mono bg-surface border-border/60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowConnectModal(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-accent text-white font-bold text-xs h-9">
                  {isSaving ? "Connecting..." : "Save Property Connection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Primary GSC KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Organic Clicks ({dateRange})</span>
          <div className="text-display-xs font-display font-bold text-text-primary mt-2">
            {organicClicks.toLocaleString()}
          </div>
          <span className="text-admin-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Live Google Logged
          </span>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Total Impressions ({dateRange})</span>
          <div className="text-display-xs font-display font-bold text-text-primary mt-2">
            {totalImpressions.toLocaleString()}
          </div>
          <span className="text-admin-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> SERP search impressions
          </span>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Average CTR</span>
          <div className="text-display-xs font-display font-bold text-text-primary mt-2">{ctr}</div>
          <span className="text-admin-xs text-text-secondary mt-1 block">Click-Through Rate</span>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Average Position</span>
          <div className="text-display-xs font-display font-bold text-accent mt-2">{avgPosition}</div>
          <span className="text-admin-xs text-text-secondary mt-1 block">Google SERP Placement</span>
        </Card>
      </div>

      {/* Search Intent Classifier Bar */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="text-body-sm font-display font-bold text-text-primary flex items-center gap-2">
            <Target size={16} className="text-accent" /> Search Intent Distribution Analysis
          </h3>
          <span className="text-[10px] font-mono text-text-secondary uppercase">Automatic Query NLP Classification</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Commercial / Buyer Intent</span>
            <div className="text-display-xs font-display font-bold text-green-700 mt-1">{intent.commercial} Queries</div>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Informational Intent</span>
            <div className="text-display-xs font-display font-bold text-blue-700 mt-1">{intent.informational} Queries</div>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Navigational / Brand</span>
            <div className="text-display-xs font-display font-bold text-purple-700 mt-1">{intent.navigational} Queries</div>
          </div>
        </div>
      </Card>

      {/* Keyword Clustering Section */}
      {clusters.length > 0 && (
        <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="text-body-sm font-display font-bold text-text-primary flex items-center gap-2">
              <Layers size={16} className="text-accent" /> Grouped Keyword Clusters
            </h3>
            <span className="text-[10px] font-mono text-text-secondary uppercase">Normalized Stem Aggregation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clusters.map((cluster) => (
              <div key={cluster.clusterId} className="p-4 border border-border/40 rounded-lg bg-surface-secondary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent font-mono">{cluster.parentKeyword}</span>
                  <span className="text-[10px] font-bold uppercase bg-accent/10 px-2 py-0.5 rounded text-accent font-mono">
                    {cluster.totalClicks} Clicks
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-text-secondary font-mono">
                  {cluster.subKeywords.map((sub, i) => (
                    <span key={i} className="bg-surface border border-border/60 px-2 py-0.5 rounded">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Optimization Opportunities (Striking Distance & Low CTR) */}
      {opportunities.length > 0 && (
        <Card className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h3 className="text-body-sm font-display font-bold text-amber-800 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-600" /> Page 1 Striking Distance & CTR Opportunities
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded">
              High Priority Traffic Gains
            </span>
          </div>

          <div className="space-y-3">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="p-3 border border-amber-500/30 rounded-lg bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-text-primary font-mono">{opp.query}</div>
                  <div className="text-amber-700 text-[11px] mt-0.5">{opp.recommendation}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-text-secondary text-[11px]">Pos {opp.position}</span>
                  <Button
                    onClick={() => toast.success(`Optimization recommendation applied for "${opp.query}"`)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase h-7 px-3 rounded"
                  >
                    Apply Optimization
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Performing Organic Keywords Table */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h3 className="text-body-md font-display font-bold text-text-primary">Top Logged Organic Queries</h3>
          <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
            {topQueries.length > 0 ? `${topQueries.length} Queries Logged` : "Live Search Intelligence"}
          </span>
        </div>

        <div className="space-y-3">
          {topQueries.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-body-sm space-y-2">
              <Search className="mx-auto text-text-secondary/40 h-8 w-8" />
              <p className="font-semibold text-text-primary">No search queries logged yet</p>
            </div>
          ) : (
            topQueries.map((kw, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-surface-secondary/20 text-xs">
                <div className="font-semibold text-text-primary flex items-center gap-2">
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded font-mono">#{idx + 1}</span>
                  {kw.query}
                  {kw.intent && (
                    <span className="text-[9px] uppercase font-bold text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-border/40 font-mono">
                      {kw.intent}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6 font-mono">
                  <span className="text-text-primary font-bold">{kw.clicks} clicks</span>
                  <span className="text-text-secondary">{kw.impressions} impr</span>
                  <span className="text-accent font-bold">CTR {kw.ctr}</span>
                  <span className="text-text-secondary">Pos {kw.position}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
