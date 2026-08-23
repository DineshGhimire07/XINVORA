"use client"

import React, { useState } from "react"
import { Layers, ChevronDown, ChevronUp, Eye } from "lucide-react"
import type { CompilationLayer } from "@/domains/photography/contracts/prompt.contract"

interface PromptInspectorProps {
  layers: CompilationLayer[]
  activeRoleName: string
}

export function PromptInspector({ layers, activeRoleName }: PromptInspectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-border/80 rounded-sm bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 flex items-center justify-between text-left bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Prompt Compiler Inspector ({layers.length} Layers)
          </span>
          <span className="text-[10px] text-text-tertiary font-mono">
            [{activeRoleName}]
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
          <span>{isOpen ? "Hide Layers" : "Inspect Compilation Steps"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 border-t border-border/60 bg-surface-secondary/10">
          <p className="text-[11px] text-text-secondary">
            Deterministic step-by-step breakdown of every instruction layer compiled into the final prompt sent to the AI model.
          </p>

          <div className="space-y-2">
            {layers.map((layer) => (
              <div key={layer.step} className="p-2.5 bg-surface border border-border/60 rounded-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-text-primary">
                    {layer.title}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-surface-secondary rounded-xs text-text-tertiary">
                    Step {layer.step}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-text-secondary whitespace-pre-wrap bg-surface-secondary/40 p-2 rounded-xs border border-border/30 max-h-32 overflow-y-auto">
                  {layer.content || "<Omitted (Optional variable not set)>"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
