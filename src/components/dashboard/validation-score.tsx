"use client";

interface ValidationScoreProps {
  score: number;
  breakdown: {
    conversion: number;
    traffic: number;
    engagement: number;
    quality: number;
  };
}

export function ValidationScore({ score, breakdown }: ValidationScoreProps) {
  const color =
    score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : score > 0 ? "#ef4444" : "#6b7280";

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${score * 2.64} 264`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">{score}</span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <ScoreBar label="Conversion" value={breakdown.conversion} weight="40%" />
        <ScoreBar label="Traffic" value={breakdown.traffic} weight="25%" />
        <ScoreBar label="Engagement" value={breakdown.engagement} weight="20%" />
        <ScoreBar label="Quality" value={breakdown.quality} weight="15%" />
      </div>
    </div>
  );
}

function ScoreBar({ label, value, weight }: { label: string; value: number; weight: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 text-muted-foreground">
        {label} <span className="text-xs">({weight})</span>
      </span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium">{value}</span>
    </div>
  );
}
