import { Truck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface WishlistUtilityPanelProps {
  itemCount: number
  totalAmount: number
  onAddAllToCart: () => void
  onClearWishlist: () => void
  isPending: boolean
  isClearing: boolean
}

export function WishlistUtilityPanel({
  itemCount,
  totalAmount,
  onAddAllToCart,
  onClearWishlist,
  isPending,
  isClearing
}: WishlistUtilityPanelProps) {
  return (
    <aside className="p-6 bg-surface border border-border rounded-lg text-left shadow-xs">
      <div className="flex flex-col gap-6">
        {/* Editorial Header */}
        <h2 className="text-body-md font-bold text-text-primary uppercase tracking-wider">
          Order Summary
        </h2>

        {/* Pricing rows */}
        <div className="flex flex-col gap-3">
          {/* Subtotal */}
          <div className="flex justify-between items-center text-body-sm text-text-primary">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
          </div>

          {/* Shipping info */}
          <div className="flex justify-between items-center text-body-sm text-text-primary">
            <span className="font-medium">Shipping</span>
            <span className="text-text-secondary text-body-xs">Calculated at checkout</span>
          </div>
        </div>

        {/* Divider & Total */}
        <div className="pt-6 border-t border-border flex flex-col">
          <div className="flex justify-between items-baseline">
            <span className="text-heading-xs font-semibold text-text-primary uppercase tracking-wider">Total</span>
            <span className="text-heading-xs font-semibold text-text-primary">{formatCurrency(totalAmount)}</span>
          </div>

          {/* Sub-label text */}
          <p className="text-caption text-text-secondary text-center mt-3">
            Taxes and shipping calculated at checkout
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onAddAllToCart}
            disabled={isPending || isClearing || itemCount === 0}
            className="w-full bg-ink hover:bg-ink-soft text-white h-12 text-[11px] tracking-widest uppercase font-bold transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm"
          >
            <span>Proceed To Checkout</span>
            <span className="text-xs">→</span>
          </button>

          <button
            onClick={onClearWishlist}
            disabled={isPending || isClearing || itemCount === 0}
            className="w-full border border-black/20 hover:border-black/50 hover:bg-neutral-50 text-black h-12 text-[11px] tracking-widest uppercase font-bold transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm"
          >
            <span>Clear Wishlist</span>
          </button>
        </div>

        {/* Estimated Delivery Section (Matching Cart page mockup exactly) */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-body-sm font-medium text-text-primary mb-3">
            <Truck className="w-4 h-4" />
            <span>Estimated delivery</span>
          </div>
          <div className="space-y-2 text-body-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Kathmandu Valley</span>
              <span className="text-text-tertiary font-medium">2-4 Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Outside Valley</span>
              <span className="text-text-tertiary font-medium">3-7 Days</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
