"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, Radar } from "lucide-react";
import type { ScanProgressEvent } from "@/types/scanner";

interface ScanProgressProps {
  events: ScanProgressEvent[];
  isRunning: boolean;
}

function stepIcon(type: ScanProgressEvent["type"]) {
  switch (type) {
    case "status":
    case "progress":
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    case "result":
    case "done":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
  }
}

export function ScanProgress({ events, isRunning }: ScanProgressProps) {
  const latestEvent = events[events.length - 1];
  const isDone = latestEvent?.type === "done";
  const hasError = events.some((e) => e.type === "error");

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          {isRunning ? (
            <Radar className="h-5 w-5 text-primary animate-pulse" />
          ) : isDone ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : hasError ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            <Radar className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isRunning
                ? "Scan in progress..."
                : isDone
                  ? "Scan complete"
                  : hasError
                    ? "Scan failed"
                    : "Waiting..."}
            </p>
            {latestEvent?.message && (
              <p className="text-xs text-muted-foreground">{latestEvent.message}</p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {isRunning && latestEvent?.current && latestEvent?.total && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span className="text-xs font-medium">{latestEvent.step?.replace(/_/g, " ")}</span>
              <span>{latestEvent.current}/{latestEvent.total}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 shadow-[2px_0_8px_rgba(99,102,241,0.4)]"
                style={{ width: `${(latestEvent.current / latestEvent.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Event log */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {events.map((event, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              {stepIcon(event.type)}
              <span className="text-muted-foreground">{event.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
