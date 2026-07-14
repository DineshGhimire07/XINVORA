"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

interface ChartDataPoint {
  label: string
  value: number
}

interface DonutChartProps {
  data: ChartDataPoint[]
  height?: number
}

export function DonutChart({ data, height = 240 }: DonutChartProps) {
  const COLORS = [
    "var(--admin-chart-primary)",
    "var(--admin-chart-secondary)",
    "var(--admin-chart-compare)",
    "#8b5cf6",
    "#ec4899",
  ]

  return (
    <div className="w-full h-full min-h-[200px]" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            nameKey="label"
            dataKey="value"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={4}
            cx="50%"
            cy="50%"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              borderRadius: "var(--admin-radius-sm)",
              fontSize: "12px",
            }}
            itemStyle={{ color: "var(--admin-text-primary)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
