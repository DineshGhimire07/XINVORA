"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { storeContactSettingsSchema } from "@/validations/settings"
import { updateStoreContactSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTransition } from "react"
import { toast } from "sonner"

export function StoreContactForm({ defaultValues }: { defaultValues: z.infer<typeof storeContactSettingsSchema> }) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof storeContactSettingsSchema>>({
    resolver: zodResolver(storeContactSettingsSchema),
    defaultValues
  })

  function onSubmit(data: z.infer<typeof storeContactSettingsSchema>) {
    startTransition(async () => {
      const result = await updateStoreContactSettingsAction(data)
      if (result.success) {
        toast.success("Contact settings saved")
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
          <Label>Support Email</Label>
          <Input {...form.register("supportEmail")} placeholder="support@domain.com" />
          {form.formState.errors.supportEmail && <p className="text-sm text-red-500">{form.formState.errors.supportEmail.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Sales Email</Label>
          <Input {...form.register("salesEmail")} placeholder="sales@domain.com" />
        </div>
        <div className="space-y-2">
          <Label>Returns Email</Label>
          <Input {...form.register("returnsEmail")} placeholder="returns@domain.com" />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input {...form.register("phone")} placeholder="+1 234 567 890" />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp</Label>
          <Input {...form.register("whatsapp")} placeholder="+1 234 567 890" />
        </div>
        <div className="space-y-2">
          <Label>Office Hours</Label>
          <Input {...form.register("officeHours")} placeholder="Mon-Fri 9AM-5PM" />
        </div>
        
        <div className="col-span-1 md:col-span-2 mt-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">Social Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input {...form.register("socialLinks.instagram")} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input {...form.register("socialLinks.facebook")} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label>TikTok URL</Label>
              <Input {...form.register("socialLinks.tiktok")} placeholder="https://tiktok.com/..." />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input {...form.register("socialLinks.linkedin")} placeholder="https://linkedin.com/..." />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <Input {...form.register("socialLinks.youtube")} placeholder="https://youtube.com/..." />
            </div>
          </div>
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
