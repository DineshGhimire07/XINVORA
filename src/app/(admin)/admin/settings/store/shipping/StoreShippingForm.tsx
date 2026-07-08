"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { storeShippingSettingsSchema } from "@/validations/settings"
import { updateStoreShippingSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTransition } from "react"
import { toast } from "sonner"

export function StoreShippingForm({ defaultValues }: { defaultValues: z.infer<typeof storeShippingSettingsSchema> }) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof storeShippingSettingsSchema>>({
    resolver: zodResolver(storeShippingSettingsSchema),
    defaultValues
  })

  function onSubmit(data: z.infer<typeof storeShippingSettingsSchema>) {
    startTransition(async () => {
      const result = await updateStoreShippingSettingsAction(data)
      if (result.success) {
        toast.success("Shipping settings saved")
        form.reset(data)
      } else {
        toast.error(result.error?.message || "Failed to save")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Default Delivery Charge</Label>
          <Input 
            type="number" 
            {...form.register("defaultDeliveryCharge", { valueAsNumber: true })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Free Delivery Threshold</Label>
          <Input 
            type="number" 
            {...form.register("freeDeliveryThreshold", { valueAsNumber: true })} 
          />
          <p className="text-xs text-text-secondary mt-1">Orders above this amount get free shipping.</p>
        </div>
        <div className="space-y-2">
          <Label>Estimated Delivery Time</Label>
          <Input {...form.register("estimatedDeliveryTime")} placeholder="e.g. 2-4 Business Days" />
        </div>
        <div className="space-y-2">
          <Label>Courier Name</Label>
          <Input {...form.register("courierName")} placeholder="e.g. Standard Delivery" />
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
