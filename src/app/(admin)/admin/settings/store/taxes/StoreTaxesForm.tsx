"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { storeTaxesSettingsSchema } from "@/validations/settings"
import { updateStoreTaxesSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTransition } from "react"
import { toast } from "sonner"

export function StoreTaxesForm({ defaultValues }: { defaultValues: z.infer<typeof storeTaxesSettingsSchema> }) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof storeTaxesSettingsSchema>>({
    resolver: zodResolver(storeTaxesSettingsSchema),
    defaultValues
  })

  function onSubmit(data: z.infer<typeof storeTaxesSettingsSchema>) {
    startTransition(async () => {
      const result = await updateStoreTaxesSettingsAction(data)
      if (result.success) {
        toast.success("Taxes settings saved")
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
          <Label>Business Name</Label>
          <Input {...form.register("businessName")} placeholder="e.g. XINVORA Pvt. Ltd." />
          {form.formState.errors.businessName && <p className="text-sm text-red-500">{form.formState.errors.businessName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Business Registration No.</Label>
          <Input {...form.register("businessRegistrationNo")} />
        </div>
        <div className="space-y-2">
          <Label>PAN</Label>
          <Input {...form.register("pan")} />
        </div>
        <div className="space-y-2">
          <Label>VAT Number</Label>
          <Input {...form.register("vat")} />
        </div>
        <div className="space-y-2">
          <Label>Tax Rate (%)</Label>
          <Input 
            type="number" 
            step="0.1"
            {...form.register("taxRate", { valueAsNumber: true })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Currency Symbol</Label>
          <Input {...form.register("currencySymbol")} placeholder="e.g. Rs." />
        </div>
        <div className="space-y-2">
          <Label>Currency Code</Label>
          <Input {...form.register("currencyCode")} placeholder="e.g. NPR" />
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
