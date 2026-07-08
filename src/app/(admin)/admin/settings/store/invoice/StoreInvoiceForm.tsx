"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { storeInvoiceSettingsSchema } from "@/validations/settings"
import { updateStoreInvoiceSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTransition } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StoreInvoiceForm({ defaultValues }: { defaultValues: z.infer<typeof storeInvoiceSettingsSchema> }) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof storeInvoiceSettingsSchema>>({
    resolver: zodResolver(storeInvoiceSettingsSchema),
    defaultValues
  })

  function onSubmit(data: z.infer<typeof storeInvoiceSettingsSchema>) {
    startTransition(async () => {
      const result = await updateStoreInvoiceSettingsAction(data)
      if (result.success) {
        toast.success("Invoice settings saved")
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
          <Label>Invoice Prefix</Label>
          <Input {...form.register("invoicePrefix")} placeholder="e.g. INV-" />
        </div>
        <div className="space-y-2">
          <Label>Order Prefix</Label>
          <Input {...form.register("orderPrefix")} placeholder="e.g. XNV-" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Invoice Footer Text</Label>
          <Textarea {...form.register("invoiceFooter")} placeholder="Thank you for shopping..." rows={2} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Invoice Notes</Label>
          <Textarea {...form.register("invoiceNotes")} placeholder="Terms and conditions..." rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Paper Size</Label>
          <Select 
            onValueChange={(val) => form.setValue("invoiceSize", val, { shouldDirty: true })} 
            defaultValue={form.getValues("invoiceSize")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
              <SelectItem value="Thermal">Thermal Receipt</SelectItem>
            </SelectContent>
          </Select>
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
