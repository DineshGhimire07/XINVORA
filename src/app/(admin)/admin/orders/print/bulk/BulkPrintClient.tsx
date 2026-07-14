"use client"

import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import QRCode from "react-qr-code"
import { bulkMarkInvoicesAsPrintedAction } from "@/actions/admin/invoices.actions"
import { Printer, ArrowLeft } from "lucide-react"

interface BulkPrintClientProps {
  initialOrders: any[]
}

export function BulkPrintClient({ initialOrders }: BulkPrintClientProps) {
  const [isMarked, setIsMarked] = useState(false)

  useEffect(() => {
    // Automatically trigger print dialog on load
    const timer = setTimeout(() => {
      window.print()
    }, 1000)

    // Mark these invoices as printed in the database
    const orderIds = initialOrders.map((o) => o.id)
    bulkMarkInvoicesAsPrintedAction(orderIds).then(() => {
      setIsMarked(true)
    })

    return () => clearTimeout(timer)
  }, [initialOrders])

  // Chunk orders by 4
  const chunkedOrders: any[][] = []
  for (let i = 0; i < initialOrders.length; i += 4) {
    chunkedOrders.push(initialOrders.slice(i, i + 4))
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide everything else on print */
        @media print {
          body * {
            visibility: hidden;
          }
          #print-bulk-container, #print-bulk-container * {
            visibility: visible;
          }
          #print-bulk-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            width: 210mm !important;
            height: 297mm !important;
            page-break-after: always;
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 8mm;
            padding: 8mm;
            box-sizing: border-box;
            background: white !important;
          }
        }

        /* Screen Preview Mode */
        @media screen {
          .print-page-wrapper {
            background-color: #f3f4f6;
            min-height: 100vh;
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 40px;
          }
          .print-page {
            background: white;
            width: 210mm;
            height: 297mm;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 8mm;
            padding: 8mm;
            box-sizing: border-box;
            border: 1px solid #e5e7eb;
          }
        }

        /* Common Invoice Card styling */
        .invoice-card {
          border: 1px solid #000000;
          padding: 4mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          font-family: ui-mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          height: 135mm;
          overflow: hidden;
          background: white;
          color: black;
        }

        .inv-header {
          text-align: center;
          border-bottom: 1px solid #000;
          padding-bottom: 1.5mm;
          margin-bottom: 1.5mm;
        }
        .inv-title {
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.5px;
          margin-bottom: 0.5mm;
        }
        .inv-text {
          font-size: 7px;
          line-height: 1.2;
        }
        .inv-bold {
          font-weight: bold;
        }
        .inv-section {
          border-bottom: 1px dashed #777;
          padding-bottom: 1.5mm;
          margin-bottom: 1.5mm;
        }
        .inv-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.3mm;
        }
        .inv-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.5mm;
        }
        .inv-table th {
          border-bottom: 1px solid #000;
          text-align: left;
          padding: 0.5mm 0;
          font-weight: bold;
          font-size: 6.5px;
        }
        .inv-table td {
          padding: 0.8mm 0;
          font-size: 6.5px;
          border-bottom: 1px dashed #eee;
        }
        .inv-table .right {
          text-align: right;
        }
      `}} />

      {/* Screen Control Header */}
      <div className="no-print bg-slate-900 text-white w-full py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <a
            href="/admin/orders/print"
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Invoice Center
          </a>
          <span className="text-slate-500">|</span>
          <h2 className="text-base font-bold">
            Printing {initialOrders.length} Invoices ({chunkedOrders.length} A4 page(s))
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 font-medium">
            {isMarked ? "✓ Invoices marked as Printed" : "Updating printed statuses..."}
          </span>
          <button
            onClick={() => window.print()}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="h-4 w-4" /> Print PDF / Paper
          </button>
        </div>
      </div>

      <div id="print-bulk-container">
        <div className="print-page-wrapper">
          {chunkedOrders.map((pageOrders, pageIdx) => (
            <div key={pageIdx} className="print-page">
              {pageOrders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString("en-GB")
                return (
                  <div key={order.id} className="invoice-card">
                    {/* Header */}
                    <div className="inv-header">
                      <div className="inv-title">XINVORA</div>
                      <div className="inv-text">Premium Lifestyle Wear</div>
                      <div className="inv-text">Phone: +977-9801234567 | Web: xinvora.com.np</div>
                    </div>

                    {/* Customer details & Metadata */}
                    <div className="inv-section flex justify-between items-start gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="inv-text inv-bold text-[7.5px] truncate">
                          {order.shippingAddress?.fullName || order.user?.firstName + " " + order.user?.lastName}
                        </div>
                        <div className="inv-text truncate">{order.shippingAddress?.phone || order.user?.phone || "--"}</div>
                        <div className="inv-text text-[6.2px] leading-snug mt-0.5">
                          {order.shippingAddress?.street} {order.shippingAddress?.landmark && `(${order.shippingAddress?.landmark})`}
                          {(order.shippingAddress?.street || order.shippingAddress?.landmark) && <br />}
                          Ward {order.shippingAddress?.wardNumber}, {order.shippingAddress?.tole}
                          <br />
                          {order.shippingAddress?.municipalityName || order.shippingAddress?.municipality || ""}, {order.shippingAddress?.districtName || order.shippingAddress?.district || ""}
                          <br />
                          {order.shippingAddress?.provinceName || order.shippingAddress?.province || ""}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="inv-text inv-bold text-[7px]">ORD: {order.orderNumber}</div>
                        <div className="inv-text text-[7px]">INV: {order.invoiceNumber || "Pending"}</div>
                        <div className="inv-text">{formattedDate}</div>
                        <div className="mt-1 flex justify-end">
                          <QRCode value={order.orderNumber} size={28} level="L" />
                        </div>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="flex-1 overflow-hidden" style={{ minHeight: '35mm' }}>
                      <table className="inv-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th className="text-center">Qty</th>
                            <th className="right">Price</th>
                            <th className="right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderItems?.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="truncate max-w-[80px]" style={{ paddingRight: '1mm' }}>
                                <div className="inv-bold truncate">{item.productName}</div>
                                <div style={{ color: '#666', fontSize: '5.5px' }} className="truncate">
                                  {item.sku}
                                </div>
                              </td>
                              <td className="text-center">{item.quantity}</td>
                              <td className="right">{formatCurrency(item.unitPrice)}</td>
                              <td className="right">{formatCurrency(item.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Financials */}
                    <div className="inv-section pt-1">
                      <div className="inv-row">
                        <span className="inv-text">Subtotal</span>
                        <span className="inv-text">{formatCurrency(order.subtotal)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="inv-row">
                          <span className="inv-text text-[#b91c1c]">Discount</span>
                          <span className="inv-text text-[#b91c1c] font-semibold">
                            -{formatCurrency(order.discountAmount)}
                          </span>
                        </div>
                      )}
                      <div className="inv-row">
                        <span className="inv-text">Shipping</span>
                        <span className="inv-text">{formatCurrency(order.shippingCost)}</span>
                      </div>
                      <div className="inv-row mt-0.5 border-t border-black pt-0.5">
                        <span className="inv-text inv-bold text-[7.5px]">Total</span>
                        <span className="inv-text inv-bold text-[7.5px]">{formatCurrency(order.total)}</span>
                      </div>
                    </div>

                    {/* Footer details */}
                    <div className="text-center mt-auto">
                      <div className="inv-text inv-bold text-[7px] tracking-wide">
                        {order.paymentProvider === "CASH_ON_DELIVERY" ? "COD - CASH ON DELIVERY" : "PAID ONLINE"}
                      </div>
                      <div className="inv-text text-[6px] text-slate-500">Thank you for shopping with XINVORA!</div>
                    </div>
                  </div>
                )
              })}

              {/* Empty boxes if chunk has less than 4 */}
              {Array.from({ length: 4 - pageOrders.length }).map((_, i) => (
                <div key={i} className="invoice-card border-none bg-transparent"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
