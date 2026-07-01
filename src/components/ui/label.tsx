import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** If true, renders a subtle asterisk (*) indicating the field is required */
  required?: boolean
  /** If true, renders a subtle "(optional)" indicator beside the label text */
  optional?: boolean
}

/**
 * components/ui/label.tsx — XINVORA Form Label Component
 *
 * Accessible form label component visually coordinated with inputs and textareas.
 *
 * Usage:
 *   <Label htmlFor="email" required>Email Address</Label>
 *   <Input id="email" type="email" />
 */
export function Label({
  className,
  children,
  required,
  optional,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "text-label-md font-semibold text-text-primary select-none flex items-center gap-1.5",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {required && (
        <span
          className="text-error font-medium"
          aria-hidden="true"
          title="Required"
        >
          *
        </span>
      )}
      {optional && (
        <span
          className="text-caption text-text-tertiary font-normal normal-case italic"
          aria-hidden="true"
        >
          (optional)
        </span>
      )}
    </label>
  )
}

Label.displayName = "Label"
