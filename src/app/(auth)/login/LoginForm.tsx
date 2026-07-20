"use client"

import { useState, useTransition } from "react"
import { loginAction } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, LockIcon, ShieldAlert } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string[]; password?: string[] }>({})

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setFieldErrors({})

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    startTransition(async () => {
      const result = await loginAction(null, formData)
      if (result.success) {
        // Successful login: immediately redirect to Homepage
        router.push("/")
        router.refresh()
      } else {
        // Failed login: Preserve email, clear only password
        setPassword("")
        if (result.error?.fieldErrors) {
          setFieldErrors(result.error.fieldErrors)
        } else {
          setErrorMessage(result.error?.message || "Invalid email or password.")
        }
      }
    })
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Page Heading */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 tracking-tight">
          Welcome Back
        </h1>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2 text-left">
          <Label htmlFor="email" className="text-xs font-bold tracking-[0.15em] text-neutral-600 uppercase">
            Email Address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Mail className="h-5 w-5" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="pl-11 h-12 bg-white/70 border-neutral-200 focus:border-neutral-800 text-sm text-neutral-900 rounded-md transition-colors placeholder:text-neutral-400"
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-500 font-medium">{fieldErrors.email[0]}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2 text-left">
          <Label htmlFor="password" className="text-xs font-bold tracking-[0.15em] text-neutral-600 uppercase">
            Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Lock className="h-5 w-5" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="pl-11 pr-11 h-12 bg-white/70 border-neutral-200 focus:border-neutral-800 text-sm text-neutral-900 rounded-md transition-colors placeholder:text-neutral-400"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-500 font-medium">{fieldErrors.password[0]}</p>
          )}
          
          <div className="flex justify-end pt-1">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                alert("Password reset functionality is available via customer service or email token.")
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors underline underline-offset-2"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-md text-left flex items-start gap-2 animate-shake">
            <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-[#8C6D58] hover:bg-[#775B47] text-white font-bold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-md transition-all duration-300 shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6 select-none">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200/60" />
        </div>
        <span className="relative px-4 bg-[#FBF9F5] text-[10px] sm:text-xs text-neutral-400 uppercase tracking-[0.25em] font-semibold">
          CONTINUE WITH
        </span>
      </div>

      {/* Google Login Button */}
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full h-12 border border-neutral-200 hover:bg-white bg-white/70 text-neutral-800 rounded-md transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-3 shadow-2xs"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-800">
          Continue with Google
        </span>
      </Button>

      {/* Switch to Register */}
      <div className="pt-2 text-center text-sm text-neutral-600">
        New to XINVORA?{" "}
        <Link
          href="/register"
          className="text-neutral-900 font-bold hover:text-[#8C6D58] transition-colors underline underline-offset-4"
        >
          Create an account &rarr;
        </Link>
      </div>

      {/* Security Micro-Trust Footer */}
      <div className="pt-6 border-t border-neutral-200/50 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          <LockIcon className="h-3.5 w-3.5 text-neutral-400" />
          Secure checkout
        </span>
        <span>&bull;</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
          Encrypted account
        </span>
        <span>&bull;</span>
        <span>Your data is protected</span>
      </div>
    </div>
  )
}
