"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { DailyMetric } from "@/types/analytics";

interface TrafficChartProps {
  data: DailyMetric[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        No traffic data yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          labelFormatter={(v) => new Date(v as string).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        />
        <Area
          type="monotone"
          dataKey="pageViews"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.1}
          name="Page Views"
        />
        <Area
          type="monotone"
          dataKey="signups"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.1}
          name="Signups"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
