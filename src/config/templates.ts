export interface TemplateConfig {
  id: "minimal" | "bold" | "corporate" | "dark";
  name: string;
  description: string;
  preview: string;
  defaultColors: ColorScheme;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export const templates: TemplateConfig[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, whitespace-focused layout with subtle animations",
    preview: "/images/templates/minimal.png",
    defaultColors: {
      primary: "#6366F1",
      secondary: "#EC4899",
      background: "#FFFFFF",
      text: "#111827",
    },
  },
  {
    id: "bold",
    name: "Bold",
    description: "High-contrast, attention-grabbing design with large typography",
    preview: "/images/templates/bold.png",
    defaultColors: {
      primary: "#F59E0B",
      secondary: "#EF4444",
      background: "#FEFCE8",
      text: "#1C1917",
    },
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional, trust-building layout for B2B products",
    preview: "/images/templates/corporate.png",
    defaultColors: {
      primary: "#2563EB",
      secondary: "#0891B2",
      background: "#F8FAFC",
      text: "#0F172A",
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Modern dark theme for tech-forward products",
    preview: "/images/templates/dark.png",
    defaultColors: {
      primary: "#8B5CF6",
      secondary: "#06B6D4",
      background: "#0F172A",
      text: "#F1F5F9",
    },
  },
];

export function getTemplate(templateId: string): TemplateConfig {
  return templates.find((t) => t.id === templateId) || templates[0];
}
