import * as React from "react"
import { cn } from "@/lib/utils"

const paddingMap = {
  none: "py-0",
  sm: "py-8 md:py-12",
  md: "py-12 md:py-18",
  lg: "py-18 md:py-26",
  xl: "py-26 md:py-34",
  "2xl": "py-34 md:py-50",
} as const

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** The HTML tag to render the section as. Defaults to "section" */
  as?: React.ElementType
  /** Vertical padding size. Defaults to "md" */
  padding?: keyof typeof paddingMap
}

/**
 * components/shared/section.tsx — XINVORA Section primitive
 *
 * A Server Component layout primitive supplying standardized vertical block padding.
 * Decoupled from Container layout wrapper.
 *
 * Usage:
 *   <Section padding="lg" className="bg-surface-elevated">
 *     <Container>
 *       <h2>Section Title</h2>
 *     </Container>
 *   </Section>
 */
export function Section({
  as: Component = "section",
  className,
  padding = "md",
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(paddingMap[padding], className)}
      {...props}
    />
  )
}

Section.displayName = "Section"
export { paddingMap }
