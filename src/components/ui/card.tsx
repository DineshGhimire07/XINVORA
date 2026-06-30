"use client"

/**
 * components/ui/card.tsx — XINVORA Card System
 *
 * CVA-based card with editorial variants.
 * No hardcoded colors — all from design tokens.
 *
 * Variants: default | elevated | interactive | bordered | ghost
 *
 * Usage:
 *   <Card variant="interactive" className="p-6">
 *     <CardHeader>...</CardHeader>
 *     <CardContent>...</CardContent>
 *   </Card>
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ── Card Variants ─────────────────────────────────────────────────────────────
const cardVariants = cva(
  ["rounded-sm overflow-hidden"],
  {
    variants: {
      variant: {
        // Default — clean surface card
        default: "bg-surface border border-border",
        // Elevated — subtle shadow lift
        elevated: "bg-surface shadow-md border border-border-subtle",
        // Interactive — hover lift animation
        interactive: [
          "bg-surface border border-border",
          "transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-1 hover:border-border-strong",
          "cursor-pointer",
        ],
        // Editorial — warmer background, generous padding
        editorial: "bg-surface-elevated border border-border-subtle",
        // Bordered — stronger border emphasis, no shadow
        bordered: "bg-surface border-2 border-border",
        // Ghost — no background, just structure
        ghost: "bg-transparent",
        // Minimal — for tight layouts, no visual weight
        minimal: "bg-background",
      },

      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },

    defaultVariants: {
      variant: "default",
      padding: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

// ── Card ──────────────────────────────────────────────────────────────────────
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

// ── Card Header ───────────────────────────────────────────────────────────────
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// ── Card Title ────────────────────────────────────────────────────────────────
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-heading-sm text-text-primary font-semibold leading-tight tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// ── Card Description ──────────────────────────────────────────────────────────
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-sm text-text-secondary", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// ── Card Content ──────────────────────────────────────────────────────────────
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

// ── Card Footer ───────────────────────────────────────────────────────────────
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
}
