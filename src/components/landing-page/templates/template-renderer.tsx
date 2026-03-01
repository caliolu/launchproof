"use client";

import type { LandingPageContent, ColorScheme, TemplateId } from "@/types/landing-page";
import { TemplateMinimal } from "./template-minimal";
import { TemplateBold } from "./template-bold";
import { TemplateCorporate } from "./template-corporate";
import { TemplateDark } from "./template-dark";

interface TemplateRendererProps {
  template: TemplateId;
  content: LandingPageContent;
  colors: ColorScheme;
  onSignup?: (email: string) => void;
}

const templateMap = {
  minimal: TemplateMinimal,
  bold: TemplateBold,
  corporate: TemplateCorporate,
  dark: TemplateDark,
};

export function TemplateRenderer({ template, content, colors, onSignup }: TemplateRendererProps) {
  const Template = templateMap[template] || templateMap.minimal;
  return <Template content={content} colors={colors} onSignup={onSignup} />;
}
