"use client"

import { useActionState } from "react"
import { loginAction } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Stack } from "@/components/shared/stack"
import type { ActionResult } from "@/types/actions"

import { signIn } from "next-auth/react"

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

        <div className="relative flex items-center justify-center my-1 select-none">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-100" />
          </div>
          <span className="relative px-3 bg-[#FCFBF8] text-[9px] text-neutral-400 uppercase tracking-[0.25em] font-medium">
            or
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 border border-neutral-200 hover:bg-neutral-50/50 bg-[#FCFBF8] text-neutral-800 py-5 rounded-sm transition-all duration-300 active:scale-[0.98]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-800">
            Continue with Google
          </span>
        </Button>
      </Stack>
    </form>
  )
}
