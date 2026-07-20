"use client"

import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"

interface BarChartDataPoint {
  name: string
  value: number
  percentage: number
}

interface BarChartProps {
  data: BarChartDataPoint[]
  height?: number
  formatValue?: (value: number) => string
}

export function BarChart({ data, height = 240, formatValue }: BarChartProps) {
  const COLORS = [
    "var(--admin-chart-primary)",
    "var(--admin-chart-secondary)",
    "var(--admin-chart-compare)",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
  ]

  return (
    <div className="w-full h-full min-h-[200px]" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fill: "var(--admin-text-secondary)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              borderRadius: "var(--admin-radius-sm)",
              fontSize: "12px",
            }}
            formatter={(value: any) => [formatValue ? formatValue(Number(value)) : value, "Revenue"]}
            labelStyle={{ color: "var(--admin-text-primary)", fontWeight: "bold" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
