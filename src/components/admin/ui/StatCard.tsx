import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent: "purple" | "orange" | "blue" | "green" | "pink"
  trend?: { value: string; direction: "up" | "down" }
  className?: string
}

export function StatCard({ label, value, icon: Icon, accent, trend, className }: StatCardProps) {
  const accentBgClass = {
    purple: "bg-admin-accent-purple-bg text-admin-accent-purple-icon",
    orange: "bg-admin-accent-orange-bg text-admin-accent-orange-icon",
    blue: "bg-admin-accent-blue-bg text-admin-accent-blue-icon",
    green: "bg-admin-accent-green-bg text-admin-accent-green-icon",
    pink: "bg-admin-accent-pink-bg text-admin-accent-pink-icon",
  }[accent]

  return (
    <div className={cn("bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col justify-between", className)}>
      <div className="flex items-center justify-between">
        <span className="text-admin-xs text-admin-text-secondary font-semibold tracking-wider uppercase">
          {label}
        </span>
        <div className={cn("p-2 rounded-admin-md flex items-center justify-center", accentBgClass)}>
          <Icon className="h-5 w-5 stroke-[1.75]" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-admin-2xl font-bold text-admin-text-primary tracking-tight">
          {value}
        </span>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-admin-xs font-semibold",
              trend.direction === "up" ? "text-admin-status-success-text" : "text-admin-status-danger-text"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3.5 w-3.5 stroke-[2]" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 stroke-[2]" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  )
}
