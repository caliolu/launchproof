"use client";

import { cn } from "@/lib/utils/cn";
import { templates } from "@/config/templates";
import type { TemplateId } from "@/types/landing-page";

interface TemplatePickerProps {
  selected: TemplateId;
  onChange: (template: TemplateId) => void;
}

export function TemplatePicker({ selected, onChange }: TemplatePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Template</label>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "p-3 rounded-lg border text-left text-sm transition-colors cursor-pointer",
              selected === t.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <p className="font-medium">{t.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
