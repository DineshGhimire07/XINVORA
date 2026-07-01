import * as React from "react"
import { cn } from "@/lib/utils"

const sizeMap = {
  xs: "max-w-content-xs",
  sm: "max-w-content-sm",
  md: "max-w-content-md",
  lg: "max-w-content-lg",
  xl: "max-w-content-xl",
  "2xl": "max-w-content-2xl",
  "3xl": "max-w-content-3xl",
  site: "max-w-site",
  editorial: "max-w-editorial",
  full: "max-w-full",
} as const

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The HTML tag to render the container as. Defaults to "div" */
  as?: React.ElementType
  /** Constrained max-width of the container. Defaults to "site" (1440px) */
  size?: keyof typeof sizeMap
  /** If true, removes the default horizontal padding classes */
  clean?: boolean
}

/**
 * components/shared/container.tsx — XINVORA Container primitive
 *
 * A Server Component layout primitive representing centered, max-width boxes.
 * Decoupled from Section layout wrapper.
 *
 * Usage:
 *   <Container size="editorial">
 *     <p>Centered, width-constrained content</p>
 *   </Container>
 */
export function Container({
  as: Component = "div",
  className,
  size = "site",
  clean = false,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "w-full mx-auto",
        !clean && "px-4 sm:px-6 md:px-8 lg:px-12",
        sizeMap[size],
        className
      )}
      {...props}
    />
  )
}

Container.displayName = "Container"
