import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin text-text-tertiary",
  {
    variants: {
      size: {
        xs: "h-3.5 w-3.5 stroke-[2.5]",
        sm: "h-4.5 w-4.5 stroke-[2]",
        md: "h-6 w-6 stroke-[2]",
        lg: "h-8 w-8 stroke-[1.5]",
      },
      variant: {
        default: "text-text-tertiary",
        primary: "text-text-primary",
        accent: "text-accent",
        inverse: "text-text-inverse",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<SVGElement>,
    VariantProps<typeof spinnerVariants> {}

/**
 * components/ui/spinner.tsx — XINVORA Loading Spinner Component
 *
 * SVG-based, theme-aware spinner for async feedback.
 * Conforms to fixed design tokens, supports varying sizes and accent colors.
 *
 * Accessibility:
 * - Uses role="status" and includes screen-reader-only labels.
 *
 * Usage:
 *   <Spinner size="sm" variant="accent" />
 */
export function Spinner({ className, size, variant, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      className="inline-flex items-center justify-center"
    >
      <svg
        className={cn(spinnerVariants({ size, variant }), className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  )
}

Spinner.displayName = "Spinner"
