"use client"

import React from "react"
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SEOInspectorModalProps {
  isOpen: boolean
  onClose: () => void
  entity: any
  inspectionData: any
  onFix?: (strategyId: string) => void
}

export function SEOInspectorModal({ isOpen, onClose, entity, inspectionData, onFix }: SEOInspectorModalProps) {
  if (!isOpen || !entity || !inspectionData) return null

  const { report, schema } = inspectionData
  const { score, grade, breakdown } = report

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
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
              <span className="text-[10px] uppercase font-bold text-text-secondary">Grade {grade}</span>
            </div>
            <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Breakdown Items */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">SEO Audit Inspector Parameters</h3>
            
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

                <p className="text-body-xs text-text-secondary italic">
                  <strong className="not-italic text-text-primary">Recommendation:</strong> {item.recommendation}
                </p>
              </div>
            ))}
          </div>

          {/* Schema JSON-LD Preview */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Generated JSON-LD Structured Data</h3>
            <pre className="p-4 bg-neutral-950 text-neutral-200 rounded-lg text-[11px] font-mono overflow-x-auto border border-neutral-800 max-h-48">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
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
