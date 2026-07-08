"use client"

import * as React from "react"
import { Eye } from "lucide-react"
import { InquiryDetailsDrawer } from "./InquiryDetailsDrawer"

export function InquiriesTable({ inquiries }: { inquiries: any[] }) {
  const [selectedInquiry, setSelectedInquiry] = React.useState<any | null>(null)

  return (
    <>
      <div className="bg-white border border-border shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-secondary border-b border-border text-xs uppercase tracking-wider text-text-secondary">
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Sender</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-text-primary divide-y divide-border">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                        inq.status === "NEW" ? "bg-red-50 text-red-700 border-red-200" :
                        inq.status === "READ" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        "bg-green-50 text-green-700 border-green-200"
                      }`}>
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap" suppressHydrationWarning>
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{inq.name}</div>
                      <div className="text-xs text-text-secondary truncate w-32 md:w-48">{inq.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="truncate w-48 md:w-64 font-medium">{inq.subject}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-bold text-accent hover:text-accent/80 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InquiryDetailsDrawer 
        inquiry={selectedInquiry} 
        onClose={() => setSelectedInquiry(null)} 
      />
    </>
  )
}
