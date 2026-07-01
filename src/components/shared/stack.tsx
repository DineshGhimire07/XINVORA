import * as React from "react"
import { cn } from "@/lib/utils"

const directionMap = {
  row: "flex-row",
  col: "flex-col",
} as const

const gapMap = {
  0: "gap-0",
  0.5: "gap-0.5",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
  20: "gap-20",
  24: "gap-24",
  32: "gap-32",
  40: "gap-40",
  48: "gap-48",
  64: "gap-64",
} as const

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
  stretch: "items-stretch",
} as const

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const

const wrapMap = {
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
  reverse: "flex-wrap-reverse",
} as const

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  /** The HTML tag to render the stack as. Defaults to "div" */
  as?: React.ElementType
  /** Layout direction: "col" (vertical) or "row" (horizontal). Defaults to "col" */
  direction?: keyof typeof directionMap
  /** Space between children, mapping to XINVORA spacing tokens. Defaults to 0 */
  gap?: keyof typeof gapMap
  /** Cross-axis alignment. Defaults to "stretch" */
  align?: keyof typeof alignMap
  /** Main-axis alignment. Defaults to "start" */
  justify?: keyof typeof justifyMap
  /** Wrapping behavior. Defaults to "nowrap" */
  wrap?: keyof typeof wrapMap
}

/**
 * components/shared/stack.tsx — XINVORA Stack Layout Primitive
 *
 * A Server Component layout primitive that encapsulates flexbox alignment and gap patterns.
 * Solves layout spacing consistently without manual class string composition.
 *
 * Usage:
 *   <Stack direction="row" gap={4} align="center">
 *     <span>Left</span>
 *     <span>Right</span>
 *   </Stack>
 */
export function Stack({
  as: Component = "div",
  className,
  direction = "col",
  gap = 0,
  align = "stretch",
  justify = "start",
  wrap = "nowrap",
  ...props
}: StackProps) {
  return (
    <Component
      className={cn(
        "flex",
        directionMap[direction],
        gapMap[gap],
        alignMap[align],
        justifyMap[justify],
        wrapMap[wrap],
        className
      )}
      {...props}
    />
  )
}

Stack.displayName = "Stack"
