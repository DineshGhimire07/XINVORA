"use client"

import React, { useState } from "react"
import { Copy, Check, Sparkles, Terminal } from "lucide-react"

interface PromptCopyCardProps {
  promptText: string
  roleName: string
  version: string
  onCopySuccess: (msg: string) => void
}

export function PromptCopyCard({
  promptText,
  roleName,
  version,
  onCopySuccess,
}: PromptCopyCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText)
    setCopied(true)
    onCopySuccess(`Copied ${roleName} prompt (${version}) to clipboard!`)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = promptText.trim().split(/\s+/).filter(Boolean).length
  const charCount = promptText.length

  return (
    <div className="border border-border rounded-sm bg-surface overflow-hidden space-y-0">
      {/* Header Bar */}
      <div className="p-3 bg-surface-secondary/60 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-text-secondary" />
          <span className="text-xs font-semibold text-text-primary">
            Final Compiled Prompt
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-text-primary text-surface rounded-xs">
            {version}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-text-tertiary font-mono">
            {wordCount} words | {charCount} chars
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-text-primary text-surface rounded-xs hover:opacity-90 transition-opacity shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code / Prompt Textbox */}
      <div className="p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text">
        {promptText}
      </div>
    </div>
  )
}
