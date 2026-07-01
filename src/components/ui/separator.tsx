import * as React from "react"
import { cn } from "@/lib/utils"

export interface SeparatorProps extends React.HTMLAttributes<HTMLElement> {
  /** Orientation of the separator (horizontal or vertical) */
  orientation?: "horizontal" | "vertical"
  /**
   * Whether the element is purely decorative.
   * If true, it is hidden from assistive technologies (aria-hidden="true").
   * If false, it acts as a semantic separator (role="separator").
   */
  decorative?: boolean
}

/**
 * components/ui/separator.tsx — XINVORA Separator Component
 *
 * Visual divider supporting horizontal and vertical orientations.
 * Serves to structure content hierarchies without adding unnecessary visual noise.
 *
 * Accessibility:
 * - Uses role="separator" and aria-orientation or aria-hidden.
 *
 * Usage:
 *   <Separator />
 *   <div className="flex h-5">
 *     <span>Item 1</span>
 *     <Separator orientation="vertical" className="mx-4" />
 *     <span>Item 2</span>
 *   </div>
 */
export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  const Tag = orientation === "horizontal" ? "hr" : "div"

  return (
    <Tag
      role={decorative ? undefined : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative ? "true" : undefined}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    />
  )
}

Separator.displayName = "Separator"
