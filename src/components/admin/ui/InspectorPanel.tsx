"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface InspectorPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  tabs?: { label: string; content: React.ReactNode }[]
  children?: React.ReactNode
  width?: "sm" | "md" | "lg"
}

export function InspectorPanel({
  open,
  onOpenChange,
  title,
  tabs,
  children,
  width = "md",
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState(0)

  const widthClasses = {
    sm: "w-full max-w-sm", // 384px
    md: "w-full max-w-md", // 448px
    lg: "w-full max-w-lg", // 512px
  }[width]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50"
              />
            </Dialog.Overlay>

            {/* Slider Content */}
            <Dialog.Content asChild>
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className={cn(
                  "fixed top-0 right-0 h-screen bg-admin-surface shadow-admin-drawer flex flex-col z-50 focus:outline-none border-l border-admin-border",
                  widthClasses
                )}
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-admin-border flex items-center justify-between">
                  <Dialog.Title className="text-admin-lg font-bold text-admin-text-primary">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close className="p-1.5 hover:bg-admin-content text-admin-text-secondary hover:text-admin-text-primary rounded-admin-sm transition-colors focus:outline-none">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close Panel</span>
                  </Dialog.Close>
                </div>

                {/* Tabs Strip if provided */}
                {tabs && tabs.length > 0 && (
                  <div className="px-6 border-b border-admin-border bg-admin-content/50">
                    <div className="flex gap-6">
                      {tabs.map((tab, idx) => (
                        <button
                          key={tab.label}
                          onClick={() => setActiveTab(idx)}
                          className={cn(
                            "py-3 text-admin-sm font-semibold transition-all relative border-b-2 border-transparent focus:outline-none select-none",
                            activeTab === idx
                              ? "text-admin-text-primary border-admin-text-primary"
                              : "text-admin-text-secondary hover:text-admin-text-primary"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content body */}
                <div className="flex-1 overflow-y-auto p-6">
                  {tabs && tabs.length > 0 ? tabs[activeTab].content : children}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
