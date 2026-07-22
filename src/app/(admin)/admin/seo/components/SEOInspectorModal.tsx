"use client"

import React, { useState } from "react"
import { CheckCircle2, AlertTriangle, XCircle, X, Sparkles, Clock, TrendingUp, ArrowRight, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SEORecommendationsEngine } from "@/domains/seo/engines/recommendations.engine"
import { SEOTimelineEngine } from "@/domains/seo/engines/timeline.engine"
import { applySuggestedSEOAction } from "@/actions/admin/seo.actions"

interface SEOInspectorModalProps {
  isOpen: boolean
  onClose: () => void
  entity: any
  inspectionData: any
  onFix?: (strategyId: string) => void
}

export function SEOInspectorModal({ isOpen, onClose, entity, inspectionData, onFix }: SEOInspectorModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"RECOMMENDATION" | "TIMELINE" | "AUDIT" | "SCHEMA">("RECOMMENDATION")
  const [titleApplied, setTitleApplied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen || !entity || !inspectionData) return null

  const { report, schema } = inspectionData
  const { score, grade, breakdown } = report

  const recommendation = SEORecommendationsEngine.generateActionableRecommendation(entity)
  const timelineEvents = SEOTimelineEngine.getTimelineForEntity(entity)

  const handleApplyTitle = async () => {
    setIsSaving(true)
    try {
      const res = await applySuggestedSEOAction(
        entity.entityType,
        entity.id,
        recommendation.suggestedTitle,
        recommendation.suggestedMetaDescription
      )
      if (res.success) {
        setTitleApplied(true)
        toast.success(`SEO Title & Description saved to database for "${entity.name}"!`)
      } else {
        toast.error(res.error || "Failed to save SEO metadata")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to apply metadata")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-secondary/30">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">
                {entity.entityType}
              </span>
              <h2 className="text-body-lg font-display font-bold text-text-primary">{entity.name}</h2>
            </div>
            <p className="text-body-xs text-text-secondary mt-1 font-mono">{entity.path}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-display-xs font-display font-bold text-accent">{score}/100</div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">SEO Health &bull; Grade {grade}</span>
            </div>
            <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-border/60 bg-surface-secondary/10">
          {[
            { id: "RECOMMENDATION", label: "Actionable Recommendation", icon: Sparkles },
            { id: "TIMELINE", label: "SEO Ranking Timeline", icon: Clock },
            { id: "AUDIT", label: "Audit Breakdown", icon: CheckCircle2 },
            { id: "SCHEMA", label: "JSON-LD Schema", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all pb-2.5 ${
                  isActive ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Sub-Tab 1: Actionable Recommendations */}
          {activeSubTab === "RECOMMENDATION" && (
            <div className="space-y-6">
              {/* Quick Health Summary Checklist */}
              <div className="p-4 rounded-xl border border-border/60 bg-surface-secondary/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-green-700">
                  <CheckCircle2 size={16} /> Indexed in Google
                </div>
                <div className="flex items-center gap-1.5 text-green-700">
                  <CheckCircle2 size={16} /> Valid Schema
                </div>
                <div className="flex items-center gap-1.5 text-green-700">
                  <CheckCircle2 size={16} /> Canonical Configured
                </div>
                <div className="flex items-center gap-1.5 text-amber-700">
                  <AlertTriangle size={16} /> CTR Opportunity
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="p-6 border border-accent/40 rounded-xl bg-accent/5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-accent/20 pb-3">
                  <div className="flex items-center gap-2 text-accent font-bold">
                    <Sparkles size={18} /> High Impact Recommendation
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded">
                    Actionable Insights
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Diagnosis & Reason:</span>
                    <p className="text-body-sm font-semibold text-text-primary mt-0.5">{recommendation.reason}</p>
                  </div>

                  <div className="p-3 bg-surface border border-border/60 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Suggested Title Tag:</span>
                    <p className="text-xs font-mono text-accent font-bold">{recommendation.suggestedTitle}</p>
                  </div>

                  <div className="p-3 bg-surface border border-border/60 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Suggested Meta Description:</span>
                    <p className="text-xs text-text-primary">{recommendation.suggestedMetaDescription}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                      <TrendingUp size={14} /> {recommendation.expectedImpact}
                    </span>

                    <Button
                      onClick={handleApplyTitle}
                      disabled={titleApplied || isSaving}
                      className="bg-accent hover:bg-accent/90 text-white font-bold text-xs uppercase h-9 px-4 rounded-lg flex items-center gap-1.5"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Saving...
                        </>
                      ) : titleApplied ? (
                        <>
                          <Check size={14} /> Saved To Database
                        </>
                      ) : (
                        <>
                          Apply Suggested Metadata <ArrowRight size={14} />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: SEO Timeline */}
          {activeSubTab === "TIMELINE" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-body-sm font-display font-bold text-text-primary">Historical SEO Timeline & Ranking Progress</h3>
                <span className="text-[10px] font-mono text-text-secondary">7 Milestone Events Logged</span>
              </div>

              <div className="space-y-4 pl-4 border-l-2 border-accent/30 font-mono text-xs">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="relative pl-6 space-y-1">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-surface" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary">{event.title}</span>
                      <span className="text-[10px] text-text-secondary">{event.date}</span>
                    </div>
                    <p className="text-[11px] font-sans text-text-secondary">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Audit Breakdown */}
          {activeSubTab === "AUDIT" && (
            <div className="space-y-4">
              {breakdown.map((item: any) => (
                <div key={item.id} className="p-4 border border-border/60 rounded-lg bg-surface flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {item.status === "PASSED" && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                      {item.status === "WARNING" && <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />}
                      {item.status === "FAILED" && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                      <div>
                        <h4 className="text-body-sm font-semibold text-text-primary">{item.name}</h4>
                        <span className="text-[10px] text-text-secondary uppercase font-medium">{item.category} &bull; Score: {item.score}/{item.maxScore}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === "PASSED" ? "bg-green-100 text-green-800" : item.status === "WARNING" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="text-body-xs text-text-secondary bg-surface-secondary/40 p-3 rounded font-mono text-[11px] break-all">
                    <span className="font-semibold text-text-primary block mb-0.5">Detected Value:</span>
                    {item.detectedValue} {item.length ? `(${item.length} chars)` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-Tab 4: JSON-LD Schema */}
          {activeSubTab === "SCHEMA" && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Generated JSON-LD Structured Data</h3>
              <pre className="p-4 bg-neutral-950 text-neutral-200 rounded-lg text-[11px] font-mono overflow-x-auto border border-neutral-800 max-h-80">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-secondary/20 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="h-9 text-xs">
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  )
}
