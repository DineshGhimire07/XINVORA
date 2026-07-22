"use client"

import React, { useState } from "react"
import { Search, TrendingUp, Globe, Link2, ExternalLink, CheckCircle2, RefreshCw } from "lucide-react"
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
    topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: string; position: string }>
    gscPropertyUrl?: string
    gscConnected?: boolean
  }
}

export function SEOSearchConsoleTab({ searchConsole }: SEOSearchConsoleTabProps) {
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [propertyUrl, setPropertyUrl] = useState(searchConsole?.gscPropertyUrl || "https://xinvora.com")
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

  const organicClicks = searchConsole?.organicClicks || 0
  const totalImpressions = searchConsole?.totalImpressions || 0
  const ctr = searchConsole?.ctr || "0.0%"
  const avgPosition = searchConsole?.averagePosition || "0.0"
  const topQueries = searchConsole?.topQueries || []

  return (
    <div className="space-y-8">
      {/* Onboarding Connection Banner */}
      <Card className="p-8 rounded-2xl border border-accent/30 bg-gradient-to-r from-surface to-surface-secondary/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
            <Globe size={28} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Integration Service</span>
              {isConnected && (
                <span className="text-[10px] font-bold uppercase bg-green-500/10 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 size={12} /> Connected: {searchConsole?.gscPropertyUrl || "xinvora.com"}
                </span>
              )}
            </div>
            <h3 className="text-display-xs font-display font-bold text-text-primary mt-0.5">
              Google Search Console & Search Engine Adapters
            </h3>
            <p className="text-body-sm text-text-secondary mt-1 font-light max-w-xl">
              Pulls live organic search queries, impression metrics, click-through rates, and indexing data directly into XINVORA.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowConnectModal(true)}
          className="bg-accent hover:bg-accent/90 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 rounded-xl shrink-0 shadow-sm"
        >
          <Link2 size={15} className="mr-2" /> {isConnected ? "Manage GSC Connection" : "Connect Search Console"}
        </Button>
      </Card>

      {/* Connect GSC Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-body-md font-display font-bold text-text-primary">Connect Google Search Console</h3>
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
                  placeholder="https://xinvora.com"
                  className="h-10 text-xs font-mono bg-surface border-border/60"
                />
                <span className="text-[11px] text-text-secondary mt-1 block">
                  Enter your domain or URL prefix as registered in Google Search Console.
                </span>
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

      {/* Live Search Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Organic Clicks</span>
          <div className="text-display-xs font-display font-bold text-text-primary mt-2">
            {organicClicks.toLocaleString()}
          </div>
          <span className="text-admin-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Live Database Metrics
          </span>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Total Impressions</span>
          <div className="text-display-xs font-display font-bold text-text-primary mt-2">
            {totalImpressions.toLocaleString()}
          </div>
          <span className="text-admin-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Search & event impressions
          </span>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Average CTR</span>
          <div className="text-display-xs font-display font-bold text-text-primary mt-2">{ctr}</div>
          <span className="text-admin-xs text-text-secondary mt-1 block">Real Click-Through Rate</span>
        </Card>

        <Card className="p-6 rounded-xl border border-border/60 bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Average Position</span>
          <div className="text-display-xs font-display font-bold text-accent mt-2">{avgPosition}</div>
          <span className="text-admin-xs text-text-secondary mt-1 block">SERP Ranking Position</span>
        </Card>
      </div>

      {/* Top Performing Organic Keywords Table */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h3 className="text-body-md font-display font-bold text-text-primary">Top Organic Search Keywords</h3>
          <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
            {topQueries.length > 0 ? `${topQueries.length} Queries Logged` : "Live Search Intelligence"}
          </span>
        </div>

        <div className="space-y-3">
          {topQueries.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-body-sm space-y-2">
              <Search className="mx-auto text-text-secondary/40 h-8 w-8" />
              <p className="font-semibold text-text-primary">No search queries logged yet</p>
              <p className="text-body-xs font-light">
                Search queries executed by customers on your storefront will automatically populate here with click counts and CTR.
              </p>
            </div>
          ) : (
            topQueries.map((kw, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-surface-secondary/20 text-xs">
                <div className="font-semibold text-text-primary flex items-center gap-2">
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded font-mono">#{idx + 1}</span>
                  {kw.query}
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
