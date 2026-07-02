"use client"

/**
 * components/ui/button.tsx — XINVORA Button System
 *
 * CVA-based button with all variants.
 * All styling comes from design tokens — no hardcoded colors.
 *
 * Variants: primary | secondary | outline | ghost | link
 * Sizes:    sm | md | lg | icon
 * States:   default | loading | disabled
 *
 * Usage:
 *   <Button variant="primary" size="md" isLoading={submitting}>
 *     Add to Cart
 *   </Button>
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Button Variants (CVA) ─────────────────────────────────────────────────────
const buttonVariants = cva(
  // Base styles — apply to every variant
  [
    "inline-flex items-center justify-center gap-2",
    "font-sans font-medium tracking-wide",
    "rounded-sm",
    "border border-transparent",
    "cursor-pointer select-none",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        // ── Primary — ink black background, white text
        primary: [
          "bg-text-primary text-text-inverse",
          "hover:bg-accent hover:text-accent-foreground",
          "active:scale-[0.98]",
        ],

        // ── Secondary — surface with border
        secondary: [
          "bg-surface text-text-primary",
          "border-border",
          "hover:bg-surface-elevated hover:border-border-strong",
          "active:scale-[0.98]",
        ],

        // ── Outline — transparent, ink border
        outline: [
          "bg-transparent text-text-primary",
          "border-border",
          "hover:border-accent hover:text-accent",
          "active:scale-[0.98]",
        ],

        // ── Ghost — no background or border, for minimal contexts
        ghost: [
          "bg-transparent text-text-primary",
          "hover:bg-surface-elevated",
          "active:scale-[0.98]",
        ],

        // ── Link — appears as a text link with underline on hover
        link: [
          "bg-transparent text-text-primary underline-offset-4",
          "hover:underline hover:text-accent",
          "p-0 h-auto rounded-none",
        ],

        // ── Accent — warm taupe filled
        accent: [
          "bg-accent text-accent-foreground",
          "hover:bg-accent-hover",
          "active:scale-[0.98]",
        ],
      },

      size: {
        xs: "h-7 px-3 text-label-sm gap-1",
        sm: "h-9 px-4 text-label-sm",
        md: "h-11 px-6 text-label-md",
        lg: "h-13 px-8 text-label-lg",
        xl: "h-15 px-10 text-body-md",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

// ── Button Props ──────────────────────────────────────────────────────────────
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a child element (for Link-as-button patterns) */
  asChild?: boolean
  /** Show a loading spinner and disable interactions */
  isLoading?: boolean
  /** Loading text — shown while isLoading is true */
  loadingText?: string
  /** Icon shown on the left */
  leftIcon?: React.ReactNode
  /** Icon shown on the right */
  rightIcon?: React.ReactNode
}

// ── Button Component ──────────────────────────────────────────────────────────
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {loadingText || children}
          </>
        ) : leftIcon || rightIcon ? (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
