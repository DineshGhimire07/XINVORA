"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, MailOpen } from "lucide-react"
import { updateInquiryStatusAction } from "@/actions/inquiry.actions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function InquiryDetailsDrawer({ 
  inquiry, 
  onClose 
}: { 
  inquiry: any | null
  onClose: () => void 
}) {
  const [isUpdating, setIsUpdating] = React.useState(false)

  const handleUpdateStatus = async (newStatus: 'READ' | 'RESPONDED') => {
    if (!inquiry) return
    setIsUpdating(true)
    const res = await updateInquiryStatusAction(inquiry.id, newStatus)
    if (res.success) {
      toast.success(`Inquiry marked as ${newStatus}`)
      onClose()
    } else {
      toast.error(res.error?.message || "Failed to update status")
    }
    setIsUpdating(false)
  }

  return (
    <AnimatePresence>
      {inquiry && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-surface z-50 shadow-2xl flex flex-col border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-white">
              <div>
                <h2 className="text-lg font-display uppercase tracking-wider text-text-primary">
                  Inquiry Details
                </h2>
                <p className="text-xs text-text-secondary font-mono">
                  {new Date(inquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-[#f9f9f9]">
              
              {/* Status & Actions */}
              <div className="bg-white border border-border p-4 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase font-semibold text-text-secondary tracking-wider">
                    Status
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                    inquiry.status === "NEW" ? "bg-red-50 text-red-700 border-red-200" :
                    inquiry.status === "READ" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                    "bg-green-50 text-green-700 border-green-200"
                  }`}>
                    {inquiry.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    size="sm" variant="outline" disabled={isUpdating || inquiry.status === "READ"}
                    onClick={() => handleUpdateStatus("READ")}
                  >
                    <MailOpen className="w-3.5 h-3.5 mr-1" /> Mark as Read
                  </Button>
                  <Button 
                    size="sm" variant="outline" disabled={isUpdating || inquiry.status === "RESPONDED"}
                    onClick={() => handleUpdateStatus("RESPONDED")}
                    className={inquiry.status === "RESPONDED" ? "bg-green-50 border-green-200 text-green-700" : ""}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark as Responded
                  </Button>
                </div>
              </div>

              {/* Sender Details */}
              <div className="bg-white border border-border p-4 rounded-md shadow-sm">
                <h3 className="text-xs uppercase font-semibold text-text-secondary tracking-wider mb-3">
                  Sender Details
                </h3>
                <div className="text-sm text-text-primary space-y-2">
                  <p><span className="text-text-secondary mr-2">Name:</span> {inquiry.name}</p>
                  <p><span className="text-text-secondary mr-2">Email:</span> <a href={`mailto:${inquiry.email}`} className="text-accent underline">{inquiry.email}</a></p>
                </div>
              </div>

              {/* Message Details */}
              <div className="bg-white border border-border p-4 rounded-md shadow-sm">
                <h3 className="text-xs uppercase font-semibold text-text-secondary tracking-wider mb-3">
                  Message
                </h3>
                <div className="text-sm text-text-primary space-y-4">
                  <p className="font-semibold pb-2 border-b border-border/50">Subject: {inquiry.subject}</p>
                  <p className="whitespace-pre-wrap">{inquiry.message}</p>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
