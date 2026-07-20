"use client"

interface HeatmapChartProps {
  /** 7×24 matrix. Index 0=Sun..6=Sat, inner index 0..23 for hours. */
  data: number[][]
  height?: number
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOUR_LABELS = [
  "12 AM", "3 AM", "6 AM", "9 AM",
  "12 PM", "3 PM", "6 PM", "9 PM",
]

function getIntensityColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "var(--admin-content)"
  const ratio = value / max
  if (ratio < 0.25) return "rgba(99, 102, 241, 0.15)"
  if (ratio < 0.5) return "rgba(99, 102, 241, 0.35)"
  if (ratio < 0.75) return "rgba(99, 102, 241, 0.55)"
  return "rgba(99, 102, 241, 0.85)"
}

export function HeatmapChart({ data, height = 200 }: HeatmapChartProps) {
  // Find max value for normalization
  const max = Math.max(...data.flat())

  // We show 8 columns (every 3 hours) to keep it readable
  const displayHours = [0, 3, 6, 9, 12, 15, 18, 21]

  return (
    <div className="w-full" style={{ minHeight: height }}>
      {/* Hour labels */}
      <div className="flex items-center gap-0 ml-10 mb-1">
        {HOUR_LABELS.map((label) => (
          <div
            key={label}
            className="flex-1 text-center text-[9px] text-admin-text-secondary font-medium"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      <div className="flex flex-col gap-[3px]">
        {/* Reorder: Mon..Sun (1,2,3,4,5,6,0) */}
        {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => (
          <div key={dayIndex} className="flex items-center gap-1">
            <span className="w-9 text-right text-[10px] text-admin-text-secondary font-medium shrink-0">
              {DAY_LABELS[dayIndex]}
            </span>
            <div className="flex-1 flex gap-[3px]">
              {displayHours.map((hour) => {
                const value = data[dayIndex]?.[hour] ?? 0
                return (
                  <div
                    key={hour}
                    className="flex-1 rounded-sm transition-all duration-200 hover:ring-1 hover:ring-admin-text-secondary cursor-default relative group"
                    style={{
                      backgroundColor: getIntensityColor(value, max),
                      height: 20,
                    }}
                    title={`${DAY_LABELS[dayIndex]} ${hour}:00 — ${value} order${value !== 1 ? "s" : ""}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-admin-surface border border-admin-border text-admin-text-primary text-[9px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap hidden group-hover:block z-10">
                      {value} order{value !== 1 ? "s" : ""}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
