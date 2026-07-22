"use client"

import React, { useState } from "react"
import { Plus, Trash2, ArrowRight, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface SEORedirectsTabProps {
  redirects: any[]
  onCreateRedirect: (data: { sourceUrl: string; targetUrl: string; statusCode: number }) => void
  onDeleteRedirect: (id: string) => void
}

export function SEORedirectsTab({ redirects = [], onCreateRedirect, onDeleteRedirect }: SEORedirectsTabProps) {
  const [sourceUrl, setSourceUrl] = useState("")
  const [targetUrl, setTargetUrl] = useState("")
  const [statusCode, setStatusCode] = useState(301)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceUrl || !targetUrl) {
      toast.error("Source and Target URLs are required.")
      return
    }
    onCreateRedirect({ sourceUrl, targetUrl, statusCode })
    setSourceUrl("")
    setTargetUrl("")
    toast.success("Redirect rule created!")
  }

  return (
    <div className="space-y-6">
      {/* Create Redirect Rule Form */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface space-y-4">
        <div>
          <h3 className="text-body-md font-display font-bold text-text-primary">Create 301 / 302 / 410 Redirect Rule</h3>
          <p className="text-body-xs text-text-secondary mt-0.5">Rules are cached in-memory and evaluated instantly in HTTP Middleware.</p>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">Source URL (Old path)</label>
            <Input
              placeholder="/old-product-slug"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="h-9 text-xs bg-surface border-border/60"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">Target URL (New destination)</label>
            <Input
              placeholder="/products/new-product-slug"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="h-9 text-xs bg-surface border-border/60"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">HTTP Code</label>
            <select
              value={statusCode}
              onChange={(e) => setStatusCode(Number(e.target.value))}
              className="w-full h-9 rounded-md border border-border/60 bg-surface text-xs font-semibold text-text-primary px-3"
            >
              <option value={301}>301 Permanent</option>
              <option value={302}>302 Temporary</option>
              <option value={410}>410 Gone</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="w-full bg-text-primary text-surface font-bold text-xs uppercase tracking-wider h-9">
              <Plus size={14} className="mr-1" /> Add Rule
            </Button>
          </div>
        </form>
      </Card>

      {/* Redirect Rules Table */}
      <Card className="rounded-xl border border-border/60 bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-surface-secondary/50 text-[10px] font-bold tracking-widest uppercase text-text-secondary">
                <th className="py-4 px-6">Source URL (Old Path)</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6">Target Destination</th>
                <th className="py-4 px-4 text-center">State</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-body-sm text-text-primary">
              {redirects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-secondary italic text-body-sm">
                    No active redirect rules configured.
                  </td>
                </tr>
              ) : (
                redirects.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-secondary/30 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-text-primary">{r.sourceUrl}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-accent/10 text-accent">
                        HTTP {r.statusCode}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <ArrowRight size={12} className="text-text-secondary" /> {r.targetUrl}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-green-500/10 text-green-700 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRedirect(r.id)}
                        className="h-8 w-8 p-0 text-text-secondary hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
