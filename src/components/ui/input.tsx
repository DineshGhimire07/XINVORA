"use client"

/**
 * components/ui/input.tsx — XINVORA Input System
 *
 * CVA-based text input with all states: default, focus, error, success, disabled.
 * Designed to work with React Hook Form and Zod validation.
 *
 * Usage:
 *   <Input placeholder="Email address" error="Invalid email" />
 *   <Input variant="filled" size="lg" />
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  // Base styles
  [
    "w-full font-sans",
    "bg-surface text-text-primary",
    "placeholder:text-text-tertiary",
    "border border-border",
    "rounded-sm",
    "transition-all duration-200",
    "focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-elevated",
    "read-only:bg-surface-elevated read-only:border-border-subtle",
  ],
  {
    variants: {
      variant: {
        default: "bg-surface",
        filled: "bg-surface-elevated border-transparent focus:bg-surface",
        ghost: "border-transparent border-b-border border-b rounded-none px-0 focus:ring-0 focus:border-b-accent",
      },
      size: {
        sm: "h-9 px-3 text-body-xs",
        md: "h-11 px-4 text-body-sm",
        lg: "h-13 px-5 text-body-md",
      },
      state: {
        default: "",
        error: "border-error focus:ring-error focus:border-error",
        success: "border-success focus:ring-success focus:border-success",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Validation error message */
  error?: string
  /** Success message */
  success?: string
  /** Helper text shown below the input */
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      state,
      error,
      success,
      hint,
      type = "text",
      ...props
    },
    ref
  ) => {
    const computedState = error ? "error" : success ? "success" : state

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <input
          type={type}
          className={cn(
            inputVariants({ variant, size, state: computedState }),
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            error ? "input-error" : hint ? "input-hint" : undefined
          }
          {...props}
        />
        {error && (
          <p
            id="input-error"
            className="text-caption text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {success && !error && (
          <p className="text-caption text-success">{success}</p>
        )}
        {hint && !error && !success && (
          <p id="input-hint" className="text-caption text-text-tertiary">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }
