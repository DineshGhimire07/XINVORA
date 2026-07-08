"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { featuresSettingsSchema } from "@/validations/settings"
import { updateFeaturesSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTransition } from "react"
import { toast } from "sonner"

export function FeaturesSettingsForm({ defaultValues }: { defaultValues: z.infer<typeof featuresSettingsSchema> }) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof featuresSettingsSchema>>({
    resolver: zodResolver(featuresSettingsSchema),
    defaultValues
  })

  function onSubmit(data: z.infer<typeof featuresSettingsSchema>) {
    startTransition(async () => {
      const result = await updateFeaturesSettingsAction(data)
      if (result.success) {
        toast.success("Feature toggles saved")
        form.reset(data)
      } else {
        toast.error(result.error?.message || "Failed to save")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        
        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Analytics</Label>
            <p className="text-sm text-text-secondary">Enable store-wide tracking and analytics scripts.</p>
          </div>
          <Switch 
            checked={form.watch("analytics")} 
            onCheckedChange={(checked) => form.setValue("analytics", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Marketing & Newsletters</Label>
            <p className="text-sm text-text-secondary">Enable marketing integrations like Mailchimp or Klaviyo.</p>
          </div>
          <Switch 
            checked={form.watch("marketing")} 
            onCheckedChange={(checked) => form.setValue("marketing", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Wishlist System</Label>
            <p className="text-sm text-text-secondary">Allow customers to save products to a wishlist.</p>
          </div>
          <Switch 
            checked={form.watch("wishlist")} 
            onCheckedChange={(checked) => form.setValue("wishlist", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Product Reviews</Label>
            <p className="text-sm text-text-secondary">Enable the review and rating system on product pages.</p>
          </div>
          <Switch 
            checked={form.watch("reviews")} 
            onCheckedChange={(checked) => form.setValue("reviews", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Guest Checkout</Label>
            <p className="text-sm text-text-secondary">Allow checkout without creating an account.</p>
          </div>
          <Switch 
            checked={form.watch("guestCheckout")} 
            onCheckedChange={(checked) => form.setValue("guestCheckout", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Blog / Journal</Label>
            <p className="text-sm text-text-secondary">Enable the journal section of the website.</p>
          </div>
          <Switch 
            checked={form.watch("blog")} 
            onCheckedChange={(checked) => form.setValue("blog", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Coupons & Discounts</Label>
            <p className="text-sm text-text-secondary">Enable coupon code entry during checkout.</p>
          </div>
          <Switch 
            checked={form.watch("coupons")} 
            onCheckedChange={(checked) => form.setValue("coupons", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Live Chat</Label>
            <p className="text-sm text-text-secondary">Enable the live chat widget on the storefront.</p>
          </div>
          <Switch 
            checked={form.watch("liveChat")} 
            onCheckedChange={(checked) => form.setValue("liveChat", checked, { shouldDirty: true })} 
          />
        </div>

      </div>
      
      <div className="pt-4 border-t border-border flex justify-end">
        <Button type="submit" disabled={isPending || !form.formState.isDirty}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
