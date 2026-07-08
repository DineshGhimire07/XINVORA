"use client"

/**
 * components/ui/button.tsx — XINVORA Button System
 *
 * CVA-based button with all variants.
 * All styling comes from design tokens — no hardcoded colors.
 *
 * Design intent:
 *   Primary   → warm accent fill (taupe/sand) — brand CTA
 *   Secondary → surface with refined border
 *   Outline   → transparent, ink border — for use on light/hero backgrounds
 *   Ghost     → no chrome, icon contexts
 *   Link      → text link with underline reveal
 *   Accent    → accent foreground, used on dark sections
 *
 * Sizes:    xs | sm | md | lg | xl | icon | icon-sm | icon-lg
 * States:   default | hover | active | loading | disabled
 *
 * Usage:
 *   <Button variant="primary" size="md">Explore Collection</Button>
 *   <Button variant="outline" size="lg" asChild><Link href="/about">Our Philosophy</Link></Button>
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
    // Layout
    "inline-flex items-center justify-center gap-2",
    // Typography
    "font-sans font-bold tracking-widest uppercase text-[11px]",
    "whitespace-nowrap",
    // Shape
    "rounded-sm",
    // Interaction
    "cursor-pointer select-none",
    // Transitions — premium 300ms ease-out for all properties
    "transition-all duration-300 ease-out",
    // Focus — accessible, on-brand
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
    // Disabled
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
    // Prevent layout shift on border changes
    "border",
  ],
  {
    variants: {
      variant: {
        // ── Primary — warm accent brand fill
        // This is the main CTA. Warm taupe on cream/ivory backgrounds looks far
        // more premium than a black block — aligned with COS / ARKET aesthetic.
        primary: [
          "bg-accent border-accent text-white",
          "hover:bg-accent-hover hover:border-accent-hover",
          "active:scale-[0.98] active:brightness-95",
        ],

        // ── Secondary — clean surface with border
        secondary: [
          "bg-surface text-text-primary border-border",
          "hover:bg-surface-elevated hover:border-border-strong",
          "active:scale-[0.98]",
        ],

        // ── Outline — translucent with ink border
        // Ideal for hero sections over backgrounds — reads clearly on light and dark
        outline: [
          "bg-transparent text-text-primary border-text-primary/30",
          "hover:border-text-primary hover:bg-text-primary/[0.04]",
          "active:scale-[0.98]",
        ],

        // ── Outline Inverse — for use on dark/ink backgrounds
        "outline-inverse": [
          "bg-transparent text-white border-white/40",
          "hover:border-white hover:bg-white/[0.08]",
          "active:scale-[0.98]",
        ],

        // ── Ghost — no chrome, for minimal icon/text contexts
        ghost: [
          "bg-transparent text-text-primary border-transparent",
          "hover:bg-surface-elevated hover:border-border",
          "active:scale-[0.98]",
        ],

        // ── Destructive — error/delete actions
        destructive: [
          "bg-error text-white border-error",
          "hover:brightness-90",
          "active:scale-[0.98]",
        ],

        // ── Link — text link with underline reveal on hover
        link: [
          "bg-transparent text-text-primary border-transparent underline-offset-4",
          "hover:underline hover:text-accent",
          "p-0 h-auto rounded-none",
        ],
      },

      size: {
        xs:        "h-7  px-3  gap-1",
        sm:        "h-9  px-4",
        md:        "h-11 px-6",
        lg:        "h-13 px-8",
        xl:        "h-15 px-10",
        icon:      "h-10 w-10 p-0",
        "icon-sm": "h-8  w-8  p-0",
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
