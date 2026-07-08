"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { aboutPageSettingsSchema } from "@/validations/settings"
import { updateAboutPageSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Stack } from "@/components/shared/stack"

type FormData = z.infer<typeof aboutPageSettingsSchema>

export function AboutSettingsForm({ defaultValues }: { defaultValues?: FormData | null }) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(aboutPageSettingsSchema),
    defaultValues: defaultValues || {
      heroImage: "",
      curatedImage: "",
      pricingImage: "",
      futureImage: "",
    },
  })

  async function onSubmit(data: FormData) {
    setIsPending(true)
    const result = await updateAboutPageSettingsAction(data)
    setIsPending(false)
    if (result.success) {
      alert("Settings saved successfully!")
      router.refresh()
    } else {
      alert("Failed to save settings: " + result.error?.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>About Page Media</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack gap={6}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hero Image URL</label>
              <Input
                placeholder="https://example.com/hero.jpg"
                {...register("heroImage")}
              />
              {errors.heroImage && <p className="text-sm text-red-500">{errors.heroImage.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">"Curated, Not Crowded" Section Image URL</label>
              <Input
                placeholder="https://example.com/curated.jpg"
                {...register("curatedImage")}
              />
              {errors.curatedImage && <p className="text-sm text-red-500">{errors.curatedImage.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">"Designed Well. Priced Fairly" Section Image URL</label>
              <Input
                placeholder="https://example.com/pricing.jpg"
                {...register("pricingImage")}
              />
              {errors.pricingImage && <p className="text-sm text-red-500">{errors.pricingImage.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">"The Future We're Building" Section Image URL</label>
              <Input
                placeholder="https://example.com/future.jpg"
                {...register("futureImage")}
              />
              {errors.futureImage && <p className="text-sm text-red-500">{errors.futureImage.message}</p>}
            </div>
          </Stack>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
