"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TemplatePicker } from "./template-picker";
import { ContentEditor } from "./content-editor";
import { LandingPreview } from "../preview/landing-preview";
import { Badge } from "@/components/ui/badge";
import { Save, Globe, Eye } from "lucide-react";
import type { LandingPageContent, ColorScheme, TemplateId } from "@/types/landing-page";

interface LandingEditorProps {
  landingPageId: string;
  initialTemplate: TemplateId;
  initialContent: LandingPageContent;
  initialColors: ColorScheme;
  isPublished: boolean;
  slug: string;
  onSave: (data: { template: TemplateId; content: LandingPageContent; color_scheme: ColorScheme }) => Promise<void>;
  onPublish: () => Promise<void>;
  onUnpublish: () => Promise<void>;
}

export function LandingEditor({
  initialTemplate,
  initialContent,
  initialColors,
  isPublished,
  slug,
  onSave,
  onPublish,
  onUnpublish,
}: LandingEditorProps) {
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [content, setContent] = useState<LandingPageContent>(initialContent);
  const [colors] = useState<ColorScheme>(initialColors);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ template, content, color_scheme: colors });
    setSaving(false);
  }

  async function handlePublish() {
    setPublishing(true);
    if (isPublished) await onUnpublish();
    else await onPublish();
    setPublishing(false);
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Editor Sidebar */}
      <div className="w-80 border-r border-border overflow-y-auto p-4 space-y-6 bg-card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Editor</h3>
          <Badge variant={isPublished ? "success" : "secondary"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </div>

        <TemplatePicker selected={template} onChange={setTemplate} />
        <ContentEditor content={content} onChange={setContent} />

        <div className="space-y-2 pt-4 border-t border-border">
          <Button onClick={handleSave} loading={saving} className="w-full" variant="outline">
            <Save className="h-4 w-4" />
            Save changes
          </Button>
          <Button onClick={handlePublish} loading={publishing} className="w-full">
            <Globe className="h-4 w-4" />
            {isPublished ? "Unpublish" : "Publish"}
          </Button>
          {isPublished && (
            <a
              href={`/lp/${slug}`}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline py-2"
            >
              <Eye className="h-3.5 w-3.5" />
              View live page
            </a>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1">
        <LandingPreview template={template} content={content} colors={colors} />
      </div>
    </div>
  );
}
