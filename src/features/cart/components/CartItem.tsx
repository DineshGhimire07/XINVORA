"use client"

import { useActionState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { updateCartQuantityAction, removeFromCartAction } from "@/actions/cart.actions"
import { saveForLaterAction } from "@/actions/wishlist.actions"
import { Button } from "@/components/ui/button"
import { Stack } from "@/components/shared/stack"
import { Grid } from "@/components/shared/grid"
import type { CartItemResult } from "@/db/queries/types"

interface CartItemProps {
  item: CartItemResult
}

export function CartItem({ item }: CartItemProps) {
  const [updateState, updateAction, isUpdating] = useActionState<any, FormData>(updateCartQuantityAction, null)
  const [removeState, removeAction, isRemoving] = useActionState<any, FormData>(removeFromCartAction, null)
  const [saveState, saveAction, isSaving] = useActionState<any, FormData>(saveForLaterAction, null)

  const isPending = isUpdating || isRemoving || isSaving
  const primaryImage = item.variant.images[0]

  return (
    <Grid
      cols={{ base: 4, md: 6 }}
      gap={4}
      className={`py-6 border-b border-border items-center transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      <div className="col-span-1 md:col-span-1 aspect-[3/4] relative bg-surface">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText || item.variant.product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 15vw"
          />
        )}
      </div>

      <div className="col-span-3 md:col-span-2">
        <Stack gap={1}>
          <Link href={`/products/${item.variant.product.slug}`} className="hover:underline">
            <h3 className="text-body-md font-medium text-text-primary">
              {item.variant.product.name}
            </h3>
          </Link>
          <div className="text-body-sm text-text-secondary">
            {item.variant.color && <span>{item.variant.color.name}</span>}
            {item.variant.color && item.variant.size && <span> | </span>}
            {item.variant.size && <span>{item.variant.size.name}</span>}
          </div>
          <div className="text-body-sm text-text-secondary uppercase">
            {item.variant.sku}
          </div>
        </Stack>
      </div>

      <div className="col-span-2 md:col-span-1 text-left md:text-center mt-4 md:mt-0">
        <span className="text-body-md text-text-primary">
          NPR {Math.round(item.price / 100).toLocaleString()}
        </span>
      </div>

      <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 flex justify-end md:justify-center">
        <form action={updateAction} className="flex items-center border border-border">
          <input type="hidden" name="cartItemId" value={item.id} />
          
          <button
            type="submit"
            name="quantity"
            value={item.quantity - 1}
            disabled={isPending || item.quantity <= 1}
            className="px-3 py-1 text-text-primary hover:bg-surface disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            -
          </button>
          
          <span className="px-3 py-1 text-body-sm text-text-primary min-w-[2rem] text-center">
            {item.quantity}
          </span>
          
          <button
            type="submit"
            name="quantity"
            value={item.quantity + 1}
            disabled={isPending}
            className="px-3 py-1 text-text-primary hover:bg-surface disabled:opacity-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </form>
      </div>

      <div className="col-span-4 md:col-span-1 mt-4 md:mt-0 flex flex-col md:items-end gap-2">
        <form action={saveAction} className="w-full md:w-auto">
          <input type="hidden" name="cartItemId" value={item.id} />
          <input type="hidden" name="variantId" value={item.variantId} />
          <Button
            type="submit"
            variant="outline"
            disabled={isPending}
            className="text-body-xs uppercase tracking-wider w-full md:w-auto text-center"
          >
            Save for Later
          </Button>
        </form>
        <form action={removeAction} className="w-full md:w-auto">
          <input type="hidden" name="cartItemId" value={item.id} />
          <Button
            type="submit"
            variant="outline"
            disabled={isPending}
            className="text-body-xs uppercase tracking-wider text-red-500 hover:text-red-600 hover:bg-red-50/10 border-red-200/60 hover:border-red-300 w-full md:w-auto text-center"
          >
            Remove
          </Button>
        </form>
      </div>
    </Grid>
  )
}
