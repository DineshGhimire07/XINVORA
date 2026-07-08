import * as React from "react"
import { cn } from "@/lib/utils"
import { gapMap } from "./primitives"

const colMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
} as const

const smColMap = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  7: "sm:grid-cols-7",
  8: "sm:grid-cols-8",
  9: "sm:grid-cols-9",
  10: "sm:grid-cols-10",
  11: "sm:grid-cols-11",
  12: "sm:grid-cols-12",
} as const

const mdColMap = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  7: "md:grid-cols-7",
  8: "md:grid-cols-8",
  9: "md:grid-cols-9",
  10: "md:grid-cols-10",
  11: "md:grid-cols-11",
  12: "md:grid-cols-12",
} as const

const lgColMap = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
  9: "lg:grid-cols-9",
  10: "lg:grid-cols-10",
  11: "lg:grid-cols-11",
  12: "lg:grid-cols-12",
} as const

const xlColMap = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
  7: "xl:grid-cols-7",
  8: "xl:grid-cols-8",
  9: "xl:grid-cols-9",
  10: "xl:grid-cols-10",
  11: "xl:grid-cols-11",
  12: "xl:grid-cols-12",
} as const

const xxlColMap = {
  1: "2xl:grid-cols-1",
  2: "2xl:grid-cols-2",
  3: "2xl:grid-cols-3",
  4: "2xl:grid-cols-4",
  5: "2xl:grid-cols-5",
  6: "2xl:grid-cols-6",
  7: "2xl:grid-cols-7",
  8: "2xl:grid-cols-8",
  9: "2xl:grid-cols-9",
  10: "2xl:grid-cols-10",
  11: "2xl:grid-cols-11",
  12: "2xl:grid-cols-12",
} as const



type GridCols = keyof typeof colMap

export interface ResponsiveCols {
  base?: GridCols
  sm?: GridCols
  md?: GridCols
  lg?: GridCols
  xl?: GridCols
  "2xl"?: GridCols
}

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  /** The HTML tag to render the grid as. Defaults to "div" */
  as?: React.ElementType
  /** Column count configurations (supports raw number or responsive breakpoints object) */
  cols?: GridCols | ResponsiveCols
  /** Space between children, mapping to XINVORA spacing tokens. Defaults to 0 */
  gap?: keyof typeof gapMap
}

/**
 * components/shared/grid.tsx — XINVORA Grid Layout Primitive
 *
 * A Server Component layout primitive encapsulating responsive columns and spacing.
 * Replaces inline grid composition patterns.
 *
 * Usage:
 *   <Grid cols={{ base: 1, md: 2, lg: 4 }} gap={6}>
 *     <div>Item 1</div>
 *     <div>Item 2</div>
 *   </Grid>
 */
export function Grid({
  as: Component = "div",
  className,
  cols = 1,
  gap = 0,
  ...props
}: GridProps) {
  const colClasses = (() => {
    if (typeof cols === "number") {
      return colMap[cols] || "grid-cols-1"
    }

    const classes: string[] = []
    if (cols.base) classes.push(colMap[cols.base])
    if (cols.sm) classes.push(smColMap[cols.sm])
    if (cols.md) classes.push(mdColMap[cols.md])
    if (cols.lg) classes.push(lgColMap[cols.lg])
    if (cols.xl) classes.push(xlColMap[cols.xl])
    if (cols["2xl"]) classes.push(xxlColMap[cols["2xl"]])

    return classes.join(" ") || "grid-cols-1"
  })()

  return (
    <Component
      className={cn("grid", colClasses, gapMap[gap], className)}
      {...props}
    />
  )
}

Grid.displayName = "Grid"
export { gapMap }
