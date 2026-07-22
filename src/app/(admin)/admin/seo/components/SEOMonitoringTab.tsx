"use client"

import React, { useState } from "react"
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SEOMonitoringTabProps {
  issues: any[]
  onRunAudit: () => void
}

export function SEOMonitoringTab({ issues = [], onRunAudit }: SEOMonitoringTabProps) {
  const [severityFilter, setSeverityFilter] = useState<string>("ALL")

  const filtered = issues.filter((i) => severityFilter === "ALL" || i.severity === severityFilter)

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card className="p-6 rounded-xl border border-border/60 bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-body-md font-display font-bold text-text-primary">Site Scanner & Persistent Audit Issues</h3>
          <p className="text-body-xs text-text-secondary mt-0.5">Automated rule evaluation across all entity content snapshots.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-secondary/40 p-1 rounded-lg border border-border/40 text-xs font-semibold">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  severityFilter === sev ? "bg-text-primary text-surface shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <Button
            onClick={onRunAudit}
            className="bg-accent hover:bg-accent/90 text-white font-bold text-xs uppercase tracking-wider h-9 px-4 rounded-lg flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw size={14} /> Scan Site Now
          </Button>
        </div>
      </Card>

      {/* Issues Table */}
      <Card className="rounded-xl border border-border/60 bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-surface-secondary/50 text-[10px] font-bold tracking-widest uppercase text-text-secondary">
                <th className="py-4 px-6">Severity</th>
                <th className="py-4 px-6">Rule & Issue Message</th>
                <th className="py-4 px-4">Entity Type</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-6">Impact Explanation</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-body-sm text-text-primary">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary italic text-body-sm">
                    <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                    No open SEO issues detected matching filter parameters!
                  </td>
                </tr>
              ) : (
                filtered.map((issue) => (
                  <tr key={issue.id} className="hover:bg-surface-secondary/30 transition-colors">
                    <td className="py-4 px-6">
                      <span
                        className={`text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${
                          issue.severity === "HIGH"
                            ? "bg-red-500/10 text-red-700 border-red-500/20"
                            : issue.severity === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-700 border-blue-500/20"
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-text-primary">{issue.message}</div>
                      <div className="text-[10px] font-mono text-text-secondary mt-0.5">Rule ID: {issue.ruleId}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[9px] font-bold tracking-widest uppercase bg-surface-secondary px-2 py-0.5 rounded text-text-secondary border border-border/40">
                        {issue.entityType}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[10px] font-semibold text-text-secondary uppercase">{issue.category}</span>
                    </td>

                    <td className="py-4 px-6 text-body-xs text-text-secondary italic max-w-xs">{issue.impact}</td>

                    <td className="py-4 px-6 text-right">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase tracking-wider border-border/80">
                        <Wrench size={13} className="mr-1" /> Fix Issue
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
