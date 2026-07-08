"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { appearanceThemeSettingsSchema } from "@/validations/settings"
import { updateAppearanceThemeSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTransition } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AppearanceThemeForm({ defaultValues }: { defaultValues: z.infer<typeof appearanceThemeSettingsSchema> }) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof appearanceThemeSettingsSchema>>({
    resolver: zodResolver(appearanceThemeSettingsSchema),
    defaultValues
  })

  function onSubmit(data: z.infer<typeof appearanceThemeSettingsSchema>) {
    startTransition(async () => {
      const result = await updateAppearanceThemeSettingsAction(data)
      if (result.success) {
        toast.success("Theme settings saved")
        form.reset(data)
      } else {
        toast.error(result.error?.message || "Failed to save")
      }
    })
  }

  const PRESETS = [
    {
      name: "Classic Minimal",
      values: { mode: "system", primaryColor: "#000000", secondaryColor: "#ffffff", accentColor: "#666666", borderRadius: "0rem" }
    },
    {
      name: "Modern Dark",
      values: { mode: "dark", primaryColor: "#ffffff", secondaryColor: "#09090b", accentColor: "#3b82f6", borderRadius: "0.5rem" }
    },
    {
      name: "Aesthetic Nude",
      values: { mode: "light", primaryColor: "#4a3b32", secondaryColor: "#fdfbf7", accentColor: "#d4a373", borderRadius: "1rem" }
    },
    {
      name: "Vibrant Ocean",
      values: { mode: "system", primaryColor: "#0f172a", secondaryColor: "#f8fafc", accentColor: "#06b6d4", borderRadius: "0.75rem" }
    }
  ]

  const applyPreset = (values: any) => {
    Object.keys(values).forEach((key) => {
      form.setValue(key as any, values[key], { shouldDirty: true })
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      
      {/* Preset Themes Section */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Quick Presets</h3>
          <p className="text-sm text-muted-foreground">Click a preset below to instantly apply a curated look to your store.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset.values)}
              className="flex flex-col gap-2 p-3 rounded-lg border border-border hover:border-primary/50 bg-card text-left transition-all hover:shadow-sm"
            >
              <div className="text-sm font-medium">{preset.name}</div>
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: preset.values.primaryColor }} />
                <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: preset.values.secondaryColor }} />
                <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: preset.values.accentColor }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
        <div className="space-y-2 md:col-span-2">
          <Label>Color Mode Preference</Label>
          <Select 
            onValueChange={(val) => form.setValue("mode", val, { shouldDirty: true })} 
            defaultValue={form.getValues("mode")}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System Preference (Auto)</SelectItem>
              <SelectItem value="light">Always Light</SelectItem>
              <SelectItem value="dark">Always Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Primary Color (Hex)</Label>
          <div className="flex gap-3">
            <div 
              className="w-10 h-10 rounded border border-border shrink-0" 
              style={{ backgroundColor: form.watch("primaryColor") || "#000000" }}
            />
            <Input {...form.register("primaryColor")} placeholder="#000000" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Secondary Color (Hex)</Label>
          <div className="flex gap-3">
            <div 
              className="w-10 h-10 rounded border border-border shrink-0" 
              style={{ backgroundColor: form.watch("secondaryColor") || "#ffffff" }}
            />
            <Input {...form.register("secondaryColor")} placeholder="#ffffff" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Accent Color (Hex)</Label>
          <div className="flex gap-3">
            <div 
              className="w-10 h-10 rounded border border-border shrink-0" 
              style={{ backgroundColor: form.watch("accentColor") || "#cccccc" }}
            />
            <Input {...form.register("accentColor")} placeholder="#cccccc" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Global Border Radius</Label>
          <Input {...form.register("borderRadius")} placeholder="e.g. 0.5rem" />
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
