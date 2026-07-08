"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generalSettingsSchema } from "@/validations/settings"
import { updateGeneralSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTransition } from "react"
import { toast } from "sonner"

type GeneralSettingsFormProps = {
  defaultValues: z.infer<typeof generalSettingsSchema>
}

export function GeneralSettingsForm({ defaultValues }: GeneralSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  
  const form = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues
  })

  function onSubmit(data: z.infer<typeof generalSettingsSchema>) {
    startTransition(async () => {
      const result = await updateGeneralSettingsAction(data)
      if (result.success) {
        toast.success("Settings saved successfully")
        form.reset(data)
      } else {
        toast.error(result.error?.message || "Failed to save settings")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="storeName">Store Name</Label>
          <Input id="storeName" {...form.register("storeName")} placeholder="e.g. XINVORA" />
          {form.formState.errors.storeName && (
            <p className="text-sm text-red-500">{form.formState.errors.storeName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="storeTagline">Store Tagline</Label>
          <Input id="storeTagline" {...form.register("storeTagline")} placeholder="e.g. Luxury Redefined" />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="storeDescription">Store Description</Label>
          <Textarea 
            id="storeDescription" 
            {...form.register("storeDescription")} 
            placeholder="A brief description of your store..." 
            rows={3} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" {...form.register("timezone")} placeholder="e.g. Asia/Kathmandu" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="defaultLanguage">Default Language</Label>
          <Input id="defaultLanguage" {...form.register("defaultLanguage")} placeholder="e.g. en" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" {...form.register("currency")} placeholder="e.g. NPR" />
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
