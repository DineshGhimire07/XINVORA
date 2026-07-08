"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { submitInquiryAction } from "@/actions/inquiry.actions"
import { Button } from "@/components/ui/button"
import { Stack } from "@/components/shared/stack"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      variant="primary" 
      className="w-full uppercase text-[11px] font-bold tracking-widest h-11"
      disabled={pending}
    >
      {pending ? "Sending..." : "Send Message"}
    </Button>
  )
}

export function ContactForm() {
  const [state, action] = useActionState<any, FormData>(submitInquiryAction, null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setIsSuccess(true)
      toast.success("Message sent! We'll get back to you soon.")
    } else if (state?.error) {
      toast.error(state.error.message || "Failed to send message.")
    }
  }, [state])

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center py-8">
        <h2 className="text-[14px] font-bold tracking-widest text-text-primary uppercase select-none">
          Thank you
        </h2>
        <p className="text-body-sm text-text-secondary">
          Your message has been sent successfully. We will get back to you soon.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setIsSuccess(false)}
          className="uppercase text-[11px] font-bold tracking-widest h-11 px-8"
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-6">
      <Stack gap={2}>
        <h2 className="text-[11px] font-bold tracking-widest text-text-primary uppercase select-none">
          Submit an Inquiry
        </h2>
      </Stack>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-[10px] font-bold text-text-secondary uppercase select-none">
            Name
          </label>
          <input 
            type="text" 
            id="contact-name"
            name="name"
            required
            placeholder="Your name"
            className="w-full h-10 px-3 bg-background border border-border text-body-sm text-text-primary focus:outline-none focus:border-text-primary rounded-sm transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-[10px] font-bold text-text-secondary uppercase select-none">
            Email Address
          </label>
          <input 
            type="email" 
            id="contact-email"
            name="email"
            required
            placeholder="Your email address"
            className="w-full h-10 px-3 bg-background border border-border text-body-sm text-text-primary focus:outline-none focus:border-text-primary rounded-sm transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-subject" className="text-[10px] font-bold text-text-secondary uppercase select-none">
          Subject
        </label>
        <input 
          type="text" 
          id="contact-subject"
          name="subject"
          required
          placeholder="Topic of inquiry"
          className="w-full h-10 px-3 bg-background border border-border text-body-sm text-text-primary focus:outline-none focus:border-text-primary rounded-sm transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-[10px] font-bold text-text-secondary uppercase select-none">
          Message
        </label>
        <textarea 
          id="contact-message"
          name="message"
          required
          rows={4}
          placeholder="Describe your inquiry..."
          className="w-full p-3 bg-background border border-border text-body-sm text-text-primary focus:outline-none focus:border-text-primary rounded-sm transition-colors resize-none"
        />
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
