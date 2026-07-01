import * as React from "react"
import { cn } from "@/lib/utils"

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

/**
 * components/ui/skeleton.tsx — XINVORA Skeleton Loader Component
 *
 * Content placeholder used during data loading states.
 * Uses the CSS shimmer utility defined in globals.css for consistent hardware-accelerated motion.
 *
 * Accessibility:
 * - Uses aria-hidden="true" because it represents layout structure, not content.
 *
 * Usage:
 *   <Skeleton className="h-6 w-32" />
 *   <Skeleton className="h-10 w-10 rounded-full" />
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("shimmer rounded-sm", className)}
      {...props}
    />
  )
}

Skeleton.displayName = "Skeleton"
