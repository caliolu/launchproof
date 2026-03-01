"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LandingEditor } from "@/components/landing-page/editor/landing-editor";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Globe, Sparkles } from "lucide-react";
import type { LandingPageContent, ColorScheme, TemplateId } from "@/types/landing-page";

export default function LandingPageEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [landingPage, setLandingPage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasIdea, setHasIdea] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Check if project has idea summary
      const { data: project } = await supabase
        .from("projects")
        .select("idea_summary")
        .eq("id", projectId)
        .single();

      setHasIdea(!!project?.idea_summary);

      // Check for existing landing page
      const { data: pages } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (pages && pages.length > 0) {
        setLandingPage(pages[0] as unknown as Record<string, unknown>);
      }
      setLoading(false);
    }
    load();
  }, [projectId]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setLandingPage(data);
    } catch {
      // Error handling
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(data: { template: TemplateId; content: LandingPageContent; color_scheme: ColorScheme }) {
    const res = await fetch(`/api/landing-pages/${landingPage?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setLandingPage(updated);
    }
  }

  async function handlePublish() {
    const res = await fetch(`/api/landing-pages/${landingPage?.id}/publish`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      setLandingPage(updated);
    }
  }

  async function handleUnpublish() {
    const res = await fetch(`/api/landing-pages/${landingPage?.id}/publish`, { method: "DELETE" });
    if (res.ok) {
      const updated = await res.json();
      setLandingPage(updated);
    }
  }

  if (loading) return <LoadingState message="Loading landing page..." />;

  if (!hasIdea) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <EmptyState
          icon={Globe}
          title="Complete the AI Coach first"
          description="Chat with the AI Coach to define your idea, then generate your landing page."
        />
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <EmptyState
          icon={Globe}
          title="Generate your landing page"
          description="AI will create a conversion-optimized landing page from your idea."
          action={
            <Button onClick={handleGenerate} loading={generating}>
              <Sparkles className="h-4 w-4" />
              Generate landing page
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <LandingEditor
      landingPageId={landingPage.id as string}
      initialTemplate={(landingPage.template as TemplateId) || "minimal"}
      initialContent={landingPage.content as unknown as LandingPageContent}
      initialColors={landingPage.color_scheme as unknown as ColorScheme}
      isPublished={landingPage.is_published as boolean}
      slug={landingPage.slug as string}
      onSave={handleSave}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
    />
  );
}
