"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type DeviceType = "desktop" | "tablet" | "mobile";

interface DeviceToggleProps {
  device: DeviceType;
  onChange: (device: DeviceType) => void;
}

const devices = [
  { id: "desktop" as const, icon: Monitor, width: "100%" },
  { id: "tablet" as const, icon: Tablet, width: "768px" },
  { id: "mobile" as const, icon: Smartphone, width: "375px" },
];

export function DeviceToggle({ device, onChange }: DeviceToggleProps) {
  return (
    <div className="flex gap-1 bg-muted rounded-lg p-1">
      {devices.map((d) => (
        <button
          key={d.id}
          onClick={() => onChange(d.id)}
          className={cn(
            "p-1.5 rounded-md transition-colors cursor-pointer",
            device === d.id
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={d.id}
        >
          <d.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export const deviceWidths: Record<DeviceType, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};
