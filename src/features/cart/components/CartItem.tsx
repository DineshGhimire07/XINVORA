"use client"

import { useActionState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { updateCartQuantityAction, removeFromCartAction, changeCartItemVariantAction } from "@/actions/cart.actions"
import { saveForLaterAction } from "@/actions/wishlist.actions"
import type { CartItemResult } from "@/db/queries/types"

interface CartItemProps {
  item: CartItemResult
}

export function CartItem({ item }: CartItemProps) {
  const [updateState, updateAction, isUpdating] = useActionState<any, FormData>(updateCartQuantityAction, null)
  const [removeState, removeAction, isRemoving] = useActionState<any, FormData>(removeFromCartAction, null)
  const [saveState, saveAction, isSaving] = useActionState<any, FormData>(saveForLaterAction, null)
  const [sizeState, sizeAction, isSwitchingSize] = useActionState<any, FormData>(changeCartItemVariantAction, null)

  const isPending = isUpdating || isRemoving || isSaving || isSwitchingSize
  const primaryImage = item.variant.images[0]
  const currentSize = item.variant.size?.name

  // Size pills — only render if siblings have size info
  const hasSizes = item.siblingVariants.some(v => v.size)

  const SizePills = () => hasSizes ? (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {item.siblingVariants.map((v) => {
        const isSelected = v.id === item.variantId
        const label = v.size?.abbreviation || v.size?.name || "—"
        return (
          <form key={v.id} action={sizeAction}>
            <input type="hidden" name="cartItemId" value={item.id} />
            <input type="hidden" name="newVariantId" value={v.id} />
            <button
              type="submit"
              disabled={isPending || !v.inStock || isSelected}
              title={v.inStock ? v.size?.name : `${v.size?.name} — Out of Stock`}
              className={`
                h-6 min-w-[26px] px-1.5 text-[9px] font-bold tracking-wide uppercase border transition-all duration-200
                ${isSelected
                  ? "border-neutral-900 bg-neutral-900 text-white cursor-default"
                  : v.inStock
                    ? "border-transparent bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 cursor-pointer"
                    : "border-transparent bg-neutral-50 text-neutral-300 line-through cursor-not-allowed opacity-50"
                }
              `}
            >
              {label}
            </button>
          </form>
        )
      })}
    </div>
  ) : null

  return (
    <div
      className={`border-b border-border py-6 transition-opacity ${
        isPending ? "opacity-50" : "opacity-100"
      }`}
    >
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
        {/* Product Details (Image + Name + Meta + Actions) */}
        <div className="col-span-6 flex gap-6 items-center">
          <div className="w-24 aspect-[3/4] relative bg-surface rounded overflow-hidden shrink-0 border border-border">
            {primaryImage && (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || item.variant.product.name}
                fill
                className="object-cover object-top"
                sizes="15vw"
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <Link href={`/products/${item.variant.product.slug}`} className="hover:underline">
              <h3 className="font-display text-body-lg text-text-primary tracking-wide">
                {item.variant.product.name}
              </h3>
            </Link>
            
            <div className="text-body-sm text-text-secondary mt-1 flex items-center gap-1.5">
              {item.variant.size && (
                <>
                  <span className="font-medium text-text-primary">Size:</span>
                  <span className="font-semibold text-text-primary">{item.variant.size.name}</span>
                </>
              )}
              {item.variant.size && item.variant.color && <span className="mx-1 text-text-tertiary">|</span>}
              {item.variant.color && (
                <>
                  <span className="font-medium text-text-primary">Color:</span>
                  <span>{item.variant.color.name}</span>
                </>
              )}
            </div>

            {/* Inline Size Switcher */}
            <SizePills />
            
            <div className="text-body-xs text-text-secondary uppercase mt-2">
              SKU: <span className="text-accent font-medium font-mono">{item.variant.sku}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-4 text-body-xs font-semibold uppercase tracking-wider text-text-secondary">
              <form action={saveAction} className="inline-flex items-center">
                <input type="hidden" name="cartItemId" value={item.id} />
                <input type="hidden" name="variantId" value={item.variantId} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 mr-1.5" />
                  Save for later
                </button>
              </form>
              
              <span className="text-text-tertiary">|</span>
              
              <form action={removeAction} className="inline-flex items-center">
                <input type="hidden" name="cartItemId" value={item.id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="col-span-2 text-center text-body-md font-medium text-text-primary">
          NPR {Math.round(item.price / 100).toLocaleString()}
        </div>

        {/* Quantity */}
        <div className="col-span-2 flex justify-center">
          <form action={updateAction} className="flex items-center border border-border rounded bg-surface h-10 w-28 overflow-hidden">
            <input type="hidden" name="cartItemId" value={item.id} />
            <button
              type="submit"
              name="quantity"
              value={item.quantity - 1}
              disabled={isPending || item.quantity <= 1}
              className="w-8 h-full flex items-center justify-center text-text-primary hover:bg-surface-elevated disabled:opacity-30 cursor-pointer select-none transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="flex-1 h-full flex items-center justify-center text-body-sm font-medium text-text-primary select-none pointer-events-none">
              {item.quantity}
            </span>
            <button
              type="submit"
              name="quantity"
              value={item.quantity + 1}
              disabled={isPending}
              className="w-8 h-full flex items-center justify-center text-text-primary hover:bg-surface-elevated disabled:opacity-30 cursor-pointer select-none transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </form>
        </div>

        {/* Total */}
        <div className="col-span-2 text-right text-body-md font-semibold text-text-primary">
          NPR {Math.round((item.price * item.quantity) / 100).toLocaleString()}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex gap-4 items-start md:hidden">
        <div className="w-24 aspect-[3/4] relative bg-surface rounded overflow-hidden shrink-0 border border-border">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || item.variant.product.name}
              fill
              className="object-cover object-top"
              sizes="25vw"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.variant.product.slug}`} className="hover:underline">
            <h3 className="font-display text-body-md text-text-primary truncate">
              {item.variant.product.name}
            </h3>
          </Link>
          
          <div className="text-body-xs text-text-secondary mt-0.5 flex items-center gap-1">
            {item.variant.size && (
              <span>
                Size: <strong className="text-text-primary font-semibold">{item.variant.size.name}</strong>
              </span>
            )}
            {item.variant.size && item.variant.color && <span> | </span>}
            {item.variant.color && <span>Color: {item.variant.color.name}</span>}
          </div>

          {/* Inline Size Switcher on Mobile */}
          <SizePills />
          
          <div className="text-body-xs text-text-secondary uppercase mt-1">
            SKU: <span className="text-accent font-medium font-mono">{item.variant.sku}</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-body-sm font-semibold text-text-primary">
              NPR {Math.round(item.price / 100).toLocaleString()}
            </div>
            
            <form action={updateAction} className="flex items-center border border-border rounded bg-surface h-8 w-24 overflow-hidden">
              <input type="hidden" name="cartItemId" value={item.id} />
              <button
                type="submit"
                name="quantity"
                value={item.quantity - 1}
                disabled={isPending || item.quantity <= 1}
                className="w-7 h-full flex items-center justify-center text-text-primary hover:bg-surface-elevated disabled:opacity-30 cursor-pointer select-none"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="flex-1 h-full flex items-center justify-center text-body-xs font-medium text-text-primary select-none pointer-events-none">
                {item.quantity}
              </span>
              <button
                type="submit"
                name="quantity"
                value={item.quantity + 1}
                disabled={isPending}
                className="w-7 h-full flex items-center justify-center text-text-primary hover:bg-surface-elevated disabled:opacity-30 cursor-pointer select-none"
                aria-label="Increase quantity"
              >
                +
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3 mt-3 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            <form action={saveAction} className="inline-flex items-center">
              <input type="hidden" name="cartItemId" value={item.id} />
              <input type="hidden" name="variantId" value={item.variantId} />
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <Heart className="w-3 h-3 mr-1" />
                Save
              </button>
            </form>
            <span className="text-text-tertiary">|</span>
            <form action={removeAction} className="inline-flex items-center">
              <input type="hidden" name="cartItemId" value={item.id} />
              <button
                type="submit"
                disabled={isPending}
                className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
