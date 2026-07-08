"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { maintenanceSettingsSchema } from "@/validations/settings"
import { updateMaintenanceSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useTransition } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type MaintenanceSettingsFormProps = {
  defaultValues: z.infer<typeof maintenanceSettingsSchema>
}

export function MaintenanceSettingsForm({ defaultValues }: MaintenanceSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  
  const form = useForm<z.infer<typeof maintenanceSettingsSchema>>({
    resolver: zodResolver(maintenanceSettingsSchema),
    defaultValues
  })

  function onSubmit(data: z.infer<typeof maintenanceSettingsSchema>) {
    startTransition(async () => {
      const result = await updateMaintenanceSettingsAction(data)
      if (result.success) {
        toast.success("Maintenance settings saved")
        form.reset(data)
      } else {
        toast.error(result.error?.message || "Failed to save")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mode">Store Access Mode</Label>
          <Select 
            onValueChange={(val) => form.setValue("mode", val as any, { shouldDirty: true })} 
            defaultValue={form.getValues("mode")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online (Fully Accessible)</SelectItem>
              <SelectItem value="store_closed">Store Closed (Browse Only, No Checkout)</SelectItem>
              <SelectItem value="offline">Maintenance Mode (Store Completely Offline)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-text-secondary mt-1">
            "Store Closed" lets customers browse but stops checkout. "Maintenance" shows a splash screen to all non-admins.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Announcement / Maintenance Message</Label>
          <Textarea 
            id="message" 
            {...form.register("message")} 
            placeholder="e.g. We're currently upgrading the store..." 
            rows={4} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expectedReturnTime">Expected Return Time (Optional)</Label>
          <Input id="expectedReturnTime" {...form.register("expectedReturnTime")} placeholder="e.g. Today at 6:00 PM" />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Show Countdown Timer</Label>
            <p className="text-sm text-text-secondary">Display a countdown until the expected return time.</p>
          </div>
          <Switch 
            checked={form.watch("countdownEnabled")} 
            onCheckedChange={(checked) => form.setValue("countdownEnabled", checked, { shouldDirty: true })} 
          />
        </div>
      </div>
      
      <div className="pt-4 border-t border-border flex justify-end">
        <Button 
          type="submit" 
          disabled={isPending || !form.formState.isDirty}
        >
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
