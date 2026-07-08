"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  // Base styles
  [
    "w-full font-sans py-3 min-h-[100px]",
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
        sm: "px-3 text-body-xs",
        md: "px-4 text-body-sm",
        lg: "px-5 text-body-md",
      },
      state: {
        default: "",
        error: "border-error focus:ring-error focus:border-error",
        success: "border-success focus:ring-success focus:border-success",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        both: "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
      resize: "vertical",
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  /** Validation error message */
  error?: string
  /** Success message */
  success?: string
  /** Helper text shown below the textarea */
  hint?: string
}

/**
 * components/ui/textarea.tsx — XINVORA Textarea Component
 *
 * Consistent multi-line input styling matching the design tokens of the input component.
 * Compatible with React Hook Form and standard HTML focus states.
 *
 * Usage:
 *   <Textarea placeholder="Message" error="Please enter a message" />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      state,
      resize,
      error,
      success,
      hint,
      ...props
    },
    ref
  ) => {
    const id = React.useId()
    const errorId = `textarea-error-${id}`
    const successId = `textarea-success-${id}`
    const hintId = `textarea-hint-${id}`
    const computedState = error ? "error" : success ? "success" : state

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <textarea
          className={cn(
            textareaVariants({ variant, size, state: computedState, resize }),
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : success ? successId : hint ? hintId : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="text-caption text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {success && !error && (
          <p id={successId} className="text-caption text-success">{success}</p>
        )}
        {hint && !error && !success && (
          <p id={hintId} className="text-caption text-text-tertiary">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
