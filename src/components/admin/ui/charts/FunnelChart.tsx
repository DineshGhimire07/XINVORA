"use client"

import { ResponsiveContainer, FunnelChart as RechartsFunnelChart, Funnel, Cell, Tooltip, LabelList } from "recharts"

interface FunnelDataPoint {
  value: number
  name: string
  fill?: string
}

interface FunnelChartProps {
  data: FunnelDataPoint[]
  height?: number
}

export function FunnelChart({ data, height = 240 }: FunnelChartProps) {
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
        <RechartsFunnelChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              borderRadius: "var(--admin-radius-sm)",
              fontSize: "12px",
            }}
            itemStyle={{ color: "var(--admin-text-primary)" }}
          />
          <Funnel dataKey="value" data={data} isAnimationActive>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill || COLORS[index % COLORS.length]}
              />
            ))}
            <LabelList
              dataKey="name"
              position="inside"
              fill="var(--admin-on-primary)"
              stroke="none"
              fontSize={11}
            />
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>
    </div>
  )
}
