"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { appearanceHomepageSettingsSchema } from "@/validations/settings"
import { updateAppearanceHomepageSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTransition } from "react"
import { toast } from "sonner"

export function AppearanceHomepageForm({ defaultValues }: { defaultValues: z.infer<typeof appearanceHomepageSettingsSchema> }) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof appearanceHomepageSettingsSchema>>({
    resolver: zodResolver(appearanceHomepageSettingsSchema),
    defaultValues
  })

  function onSubmit(data: z.infer<typeof appearanceHomepageSettingsSchema>) {
    startTransition(async () => {
      const result = await updateAppearanceHomepageSettingsAction(data)
      if (result.success) {
        toast.success("Homepage layout saved")
        form.reset(data)
      } else {
        toast.error(result.error?.message || "Failed to save")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        
        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Hero Section</Label>
            <p className="text-sm text-text-secondary">Display the main hero banner at the top of the homepage.</p>
          </div>
          <Switch 
            checked={form.watch("heroEnabled")} 
            onCheckedChange={(checked) => form.setValue("heroEnabled", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Featured Collections</Label>
            <p className="text-sm text-text-secondary">Show curated collections on the homepage.</p>
          </div>
          <Switch 
            checked={form.watch("collectionsEnabled")} 
            onCheckedChange={(checked) => form.setValue("collectionsEnabled", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Testimonials</Label>
            <p className="text-sm text-text-secondary">Show customer reviews and testimonials.</p>
          </div>
          <Switch 
            checked={form.watch("testimonialsEnabled")} 
            onCheckedChange={(checked) => form.setValue("testimonialsEnabled", checked, { shouldDirty: true })} 
          />
        </div>

        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-surface-secondary/50">
          <div>
            <Label className="text-base">Newsletter Signup</Label>
            <p className="text-sm text-text-secondary">Display the newsletter subscription form.</p>
          </div>
          <Switch 
            checked={form.watch("newsletterEnabled")} 
            onCheckedChange={(checked) => form.setValue("newsletterEnabled", checked, { shouldDirty: true })} 
          />
        </div>

        {/* Section Order (Simplified display for now, could be a drag-drop interface later) */}
        <div className="pt-4">
          <Label>Section Rendering Order (Internal ID)</Label>
          <div className="mt-2 text-sm text-text-secondary bg-surface p-4 rounded border border-border">
            {form.watch("sectionOrder").join(" → ")}
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
