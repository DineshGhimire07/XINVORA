"use client"

import { useActionState } from "react"
import { loginAction } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Stack } from "@/components/shared/stack"
import type { ActionResult } from "@/types/actions"

export function LoginForm() {
  const [state, action, isPending] = useActionState<any, FormData>(loginAction, null)

  return (
    <form action={action} className="w-full max-w-sm mx-auto">
      <Stack gap={6}>
        <Stack gap={4}>
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
          </div>
        </Stack>

        {!state?.success && state?.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-body-sm rounded-sm">
            {state.error.message}
          </div>
        )}
        
        {state?.success && state?.data && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-body-sm rounded-sm">
            {state.data?.message}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
      </Stack>
    </form>
  )
}
