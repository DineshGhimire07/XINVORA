"use client"

import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface LineSeries {
  key: string
  name: string
  color?: string
}

interface LineChartProps {
  data: any[]
  xAxisKey: string
  series: LineSeries[]
  height?: number
}

export function LineChart({ data, xAxisKey, series, height = 240 }: LineChartProps) {
  const COLORS = [
    "var(--admin-chart-primary)",
    "var(--admin-chart-secondary)",
    "var(--admin-chart-compare)",
  ]

  return (
    <div className="w-full h-full min-h-[200px]" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" />
          <XAxis
            dataKey={xAxisKey}
            stroke="var(--admin-text-secondary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="var(--admin-text-secondary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              borderRadius: "var(--admin-radius-sm)",
              fontSize: "12px",
            }}
            labelStyle={{ color: "var(--admin-text-secondary)", fontWeight: "bold" }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px" }}
          />
          {series.map((s, idx) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color || COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1.5 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
