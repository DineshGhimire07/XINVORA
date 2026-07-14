import { getOrderDetailsAction } from "@/actions/admin/orders.actions"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import QRCode from "react-qr-code"

export default async function PrintInvoicePage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const res = await getOrderDetailsAction(id)
  
  if (!res.success || !res.data) {
    return notFound()
  }

  const order = res.data

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide EVERYTHING else on the page that isn't the print container */
          body * {
            visibility: hidden;
          }
          #print-invoice, #print-invoice * {
            visibility: visible;
          }
          #print-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 105mm !important;
            height: 148mm !important;
            margin: 0;
            padding: 5mm;
            background: white !important;
            color: black !important;
            font-size: 8px; /* Base font size for A6 */
            box-sizing: border-box;
          }
          
          @page {
            size: A6 portrait;
            margin: 0;
          }

          /* Hide scrollbars & page headers/footers */
          ::-webkit-scrollbar { display: none; }
        }

        /* Screen styles for previewing */
        #print-invoice {
          width: 105mm;
          height: 148mm;
          margin: 40px auto;
          background: white;
          color: black;
          padding: 5mm;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 9px;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Utility classes for the invoice */
        .inv-header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 2mm; margin-bottom: 2mm; }
        .inv-title { font-size: 14px; font-weight: bold; letter-spacing: 1px; margin-bottom: 1mm; }
        .inv-text { font-size: 8px; line-height: 1.2; }
        .inv-bold { font-weight: bold; }
        
        .inv-section { border-bottom: 1px dashed #ccc; padding-bottom: 2mm; margin-bottom: 2mm; }
        
        .inv-row { display: flex; justify-content: space-between; margin-bottom: 0.5mm; }
        
        .inv-table { width: 100%; border-collapse: collapse; margin-top: 1mm; }
        .inv-table th { border-bottom: 1px solid #000; text-align: left; padding: 1mm 0; font-weight: bold; font-size: 7px; }
        .inv-table td { padding: 1mm 0; font-size: 7px; border-bottom: 1px solid #eee; }
        .inv-table .right { text-align: right; }
      `}} />

      {/* Auto-print script */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.onload = function() { window.print(); }
      `}} />

      <div id="print-invoice">
        {/* Header */}
        <div className="inv-header">
          <div className="inv-title">XINVORA</div>
          <div className="inv-text">Company Address Placeholder</div>
          <div className="inv-text">Phone: +977-98XXXXXXXX | Web: xinvora.com.np</div>
          <div className="inv-text">VAT: ____________________</div>
        </div>

        {/* Shipping Label Area */}
        <div className="inv-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="inv-text inv-bold" style={{ fontSize: '10px' }}>{order.shippingAddress?.fullName}</div>
            <div className="inv-text">{order.shippingAddress?.phone}</div>
            <div className="inv-text" style={{ marginTop: '1mm' }}>
              {order.shippingAddress?.street} {order.shippingAddress?.landmark && `(${order.shippingAddress?.landmark})`}
              {(order.shippingAddress?.street || order.shippingAddress?.landmark) && <br />}
              Ward {order.shippingAddress?.wardNumber}, {order.shippingAddress?.tole}<br />
              {order.shippingAddress?.municipalityName || order.shippingAddress?.municipality || ""}, {order.shippingAddress?.districtName || order.shippingAddress?.district || ""}<br />
              {order.shippingAddress?.provinceName || order.shippingAddress?.province || ""}
            </div>
            {order.shippingAddress?.instructions && (
              <div className="inv-text" style={{ marginTop: '1mm', fontStyle: 'italic' }}>
                Note: {order.shippingAddress.instructions}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="inv-text inv-bold">ORDER: {order.orderNumber}</div>
            <div className="inv-text">INV: {order.invoiceNumber || "N/A"}</div>
            <div className="inv-text">{new Date(order.createdAt).toLocaleDateString("en-GB")}</div>
            <div className="inv-text" style={{ marginTop: '2mm' }}>
              <QRCode value={order.orderNumber} size={40} level="L" />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="inv-section" style={{ flex: 1 }}>
          <table className="inv-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th className="right">Price</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item: any, i: number) => (
                <tr key={i}>
                  <td style={{ paddingRight: '2mm' }}>
                    <div className="inv-bold">{item.productName}</div>
                    <div style={{ color: '#555', fontSize: '6px' }}>{item.sku} | {item.variant?.size?.name} {item.variant?.color?.name}</div>
                  </td>
                  <td>{item.quantity}</td>
                  <td className="right">{formatCurrency(item.unitPrice)}</td>
                  <td className="right">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="inv-section">
          <div className="inv-row">
            <span className="inv-text">Subtotal</span>
            <span className="inv-text">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="inv-row">
              <span className="inv-text">Discount</span>
              <span className="inv-text">-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="inv-row">
            <span className="inv-text">Delivery Charge</span>
            <span className="inv-text">{formatCurrency(order.shippingCost)}</span>
          </div>
          <div className="inv-row" style={{ marginTop: '1mm', borderTop: '1px solid #000', paddingTop: '1mm' }}>
            <span className="inv-text inv-bold" style={{ fontSize: '10px' }}>Grand Total</span>
            <span className="inv-text inv-bold" style={{ fontSize: '10px' }}>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
          <div className="inv-text inv-bold" style={{ marginBottom: '1mm' }}>
            {order.paymentProvider === 'CASH_ON_DELIVERY' ? 'CASH ON DELIVERY' : 'PAID ONLINE'}
          </div>
          <div className="inv-text" style={{ fontSize: '6px' }}>Thank you for shopping with XINVORA</div>
        </div>
      </div>
    </>
  )
}
