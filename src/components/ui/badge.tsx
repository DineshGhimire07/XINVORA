import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center font-sans font-semibold tracking-wider uppercase select-none rounded-full border border-transparent",
  {
    variants: {
      variant: {
        default: "bg-surface-elevated text-text-secondary border-border",
        primary: "bg-ink text-text-inverse",
        accent: "bg-accent/10 text-accent border-accent/20",
        success: "bg-success-muted text-success border-success/20",
        warning: "bg-warning-muted text-warning border-warning/20",
        error: "bg-error-muted text-error border-error/20",
        muted: "bg-surface-elevated text-text-tertiary border-border-subtle",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] leading-none",
        md: "px-2.5 py-1 text-[11px] leading-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * components/ui/badge.tsx — XINVORA Badge Component
 *
 * Small inline label for displaying categories, stock statuses, or item properties.
 * Designed with strict adherence to brand visual tokens and typography styles.
 *
 * Usage:
 *   <Badge variant="accent">New</Badge>
 *   <Badge variant="success" size="sm">In Stock</Badge>
 */
export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

Badge.displayName = "Badge"

export { badgeVariants }
