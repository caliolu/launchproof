"use client";

import { TemplateRenderer } from "../templates/template-renderer";
import { DeviceToggle, deviceWidths, type DeviceType } from "./device-toggle";
import type { LandingPageContent, ColorScheme, TemplateId } from "@/types/landing-page";
import { useState } from "react";

interface LandingPreviewProps {
  template: TemplateId;
  content: LandingPageContent;
  colors: ColorScheme;
}

export function LandingPreview({ template, content, colors }: LandingPreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <span className="text-sm font-medium text-muted-foreground">Preview</span>
        <DeviceToggle device={device} onChange={setDevice} />
      </div>
      <div className="flex-1 overflow-auto bg-muted/50 p-4 flex justify-center">
        <div
          className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
          style={{ width: deviceWidths[device], maxWidth: "100%" }}
        >
          <TemplateRenderer
            template={template}
            content={content}
            colors={colors}
          />
        </div>
      </div>
    </div>
  );
}
