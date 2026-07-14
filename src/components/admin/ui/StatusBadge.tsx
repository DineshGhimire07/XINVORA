import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.trim().toLowerCase()

  let colorClasses = "bg-admin-status-neutral-bg text-admin-status-neutral-text"

  if (["paid", "confirmed", "delivered", "active", "printed", "published"].includes(normalized)) {
    colorClasses = "bg-admin-status-success-bg text-admin-status-success-text"
  } else if (["pending", "pending_payment", "payment_pending_verification", "processing", "packed", "draft", "scheduled"].includes(normalized)) {
    colorClasses = "bg-admin-status-warning-bg text-admin-status-warning-text"
  } else if (["shipped", "out_for_delivery"].includes(normalized)) {
    colorClasses = "bg-admin-status-info-bg text-admin-status-info-text"
  } else if (["cancelled", "refunded", "failed", "void", "out of stock", "archived"].includes(normalized)) {
    colorClasses = "bg-admin-status-danger-bg text-admin-status-danger-text"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 text-admin-xs font-medium rounded-admin-sm select-none whitespace-nowrap",
        colorClasses,
        className
      )}
    >
      {status}
    </span>
  )
}
