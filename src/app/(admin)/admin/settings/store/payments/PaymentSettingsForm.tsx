"use client"

import * as React from "react"
import { toast } from "sonner"
import { paymentQRSettingsSchema } from "@/validations/settings"
import { updatePaymentQRSettingsAction } from "@/actions/admin/settings.actions"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MediaSelector } from "@/components/admin/MediaSelector"

type FormData = z.infer<typeof paymentQRSettingsSchema>

export function PaymentSettingsForm({ defaultValues, mediaItems }: { defaultValues: Partial<FormData>, mediaItems: any[] }) {
  const [isPending, startTransition] = React.useTransition()
  
  const [formData, setFormData] = React.useState<FormData>({
    esewaUrl: defaultValues?.esewaUrl || "",
    khaltiUrl: defaultValues?.khaltiUrl || "",
    bankUrl: defaultValues?.bankUrl || "",
    bankDetails: defaultValues?.bankDetails || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleMediaChange = (field: keyof FormData) => (images: string[]) => {
    // We only want a single image for QR code, so we take the last one selected
    const lastImage = images.length > 0 ? images[images.length - 1] : ""
    setFormData(prev => ({ ...prev, [field]: lastImage }))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const parsed = paymentQRSettingsSchema.safeParse(formData)
    if (!parsed.success) {
      toast.error("Please fill in all required fields correctly.")
      return
    }

    startTransition(async () => {
      const result = await updatePaymentQRSettingsAction(parsed.data)
      if (result.success) {
        toast.success("Payment settings updated successfully.")
      } else {
        toast.error(result.error?.message || "Failed to update settings.")
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-8">
        
        <div className="space-y-4">
          <div>
            <Label>eSewa QR Code Image</Label>
            <p className="text-xs text-text-secondary mb-3">Upload or select your eSewa QR code image.</p>
          </div>
          <MediaSelector 
            mediaItems={mediaItems}
            selectedImages={formData.esewaUrl ? [formData.esewaUrl] : []}
            onChange={handleMediaChange("esewaUrl")}
          />
        </div>

        <div className="space-y-4">
          <div>
            <Label>Khalti QR Code Image</Label>
            <p className="text-xs text-text-secondary mb-3">Upload or select your Khalti QR code image.</p>
          </div>
          <MediaSelector 
            mediaItems={mediaItems}
            selectedImages={formData.khaltiUrl ? [formData.khaltiUrl] : []}
            onChange={handleMediaChange("khaltiUrl")}
          />
        </div>

        <div className="space-y-4">
          <div>
            <Label>Bank Transfer QR Code Image</Label>
            <p className="text-xs text-text-secondary mb-3">Upload or select your Bank QR code image.</p>
          </div>
          <MediaSelector 
            mediaItems={mediaItems}
            selectedImages={formData.bankUrl ? [formData.bankUrl] : []}
            onChange={handleMediaChange("bankUrl")}
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <Label htmlFor="bankDetails">Bank Account Details (Optional)</Label>
          <Textarea 
            id="bankDetails" 
            name="bankDetails"
            value={formData.bankDetails} 
            onChange={handleChange}
            placeholder="Bank Name: XYZ Bank&#10;Account Name: Your Name&#10;Account Number: 000000000" 
            className="min-h-[100px]"
          />
          <p className="text-xs text-text-secondary">Provide manual bank transfer instructions for customers.</p>
        </div>

      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  )
}
