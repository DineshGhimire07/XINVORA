"use client"

import { useActionState } from "react"
import { registerAction } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Stack } from "@/components/shared/stack"
import type { ActionResult } from "@/types/actions"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const [state, action, isPending] = useActionState<any, FormData>(registerAction, null)
  const router = useRouter()

  // Handle successful registration side-effect if needed
  if (state?.success) {
    // We could redirect directly here, or display a message and add a button.
    // The action already returned success. We will show the success message and a login link.
  }

  return (
    <form action={action} className="w-full max-w-sm mx-auto">
      <Stack gap={6}>
        {state?.success ? (
          <Stack gap={4} className="p-6 bg-surface border border-border text-center rounded-sm">
            <h3 className="text-body-lg font-bold text-text-primary">Account Created</h3>
            <p className="text-body-sm text-text-secondary">{state.data?.message}</p>
            <Button type="button" onClick={() => router.push("/login")} className="w-full mt-4">
              Proceed to Login
            </Button>
          </Stack>
        ) : (
          <>
            <Stack gap={4} className="text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" required disabled={isPending} />
                  {!state?.success && state?.error?.fieldErrors?.firstName && (
                    <p className="text-body-xs text-red-500">{state.error.fieldErrors.firstName[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" required disabled={isPending} />
                  {!state?.success && state?.error?.fieldErrors?.lastName && (
                    <p className="text-body-xs text-red-500">{state.error.fieldErrors.lastName[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" required disabled={isPending} />
                {!state?.success && state?.error?.fieldErrors?.email && (
                  <p className="text-body-xs text-red-500">{state.error.fieldErrors.email[0]}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required disabled={isPending} />
                {!state?.success && state?.error?.fieldErrors?.password && (
                  <p className="text-body-xs text-red-500">{state.error.fieldErrors.password[0]}</p>
                )}
                <p className="text-[10px] text-text-secondary">
                  Must be at least 10 characters, including an uppercase letter, lowercase letter, number, and special character.
                </p>
              </div>
            </Stack>

            {!state?.success && state?.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-body-sm rounded-sm">
                {state.error.message}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Creating account..." : "Create Account"}
            </Button>
          </>
        )}
      </Stack>
    </form>
  )
}
