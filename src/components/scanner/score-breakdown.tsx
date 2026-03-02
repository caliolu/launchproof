"use client";

import { cn } from "@/lib/utils/cn";

interface ScoreBreakdownProps {
  demand: number;
  weakness: number;
  frequency: number;
  wtp: number;
  feasibility: number;
  composite: number;
  className?: string;
}

const dimensions = [
  { key: "demand", label: "Demand", color: "bg-blue-500" },
  { key: "weakness", label: "Competitor Weakness", color: "bg-orange-500" },
  { key: "frequency", label: "Frequency", color: "bg-purple-500" },
  { key: "wtp", label: "Willingness to Pay", color: "bg-green-500" },
  { key: "feasibility", label: "Feasibility", color: "bg-cyan-500" },
] as const;

export function ScoreBreakdown({
  demand,
  weakness,
  frequency,
  wtp,
  feasibility,
  composite,
  className,
}: ScoreBreakdownProps) {
  const scores: Record<string, number> = { demand, weakness, frequency, wtp, feasibility };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Score Breakdown</h4>
        <span className={cn("text-2xl font-bold tabular-nums", composite >= 70 && "bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent")}>
          {Math.round(composite)}
          <span className={cn("text-sm font-normal", composite >= 70 ? "text-purple-400" : "text-muted-foreground")}>/100</span>
        </span>
      </div>

      <div className="space-y-3">
        {dimensions.map((dim) => {
          const value = scores[dim.key] || 0;
          return (
            <div key={dim.key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">{dim.label}</span>
                <span className="font-medium tabular-nums">{Math.round(value)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted/80 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", dim.color)}
                  style={{ width: `${Math.min(100, value)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
