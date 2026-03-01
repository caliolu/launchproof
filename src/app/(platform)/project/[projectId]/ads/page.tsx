"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdPreviewCard } from "@/components/ads/ad-preview-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Megaphone, Sparkles } from "lucide-react";

type AdCampaign = {
  id: string;
  channel: string;
  recommended: boolean;
  recommendation_reason: string | null;
  content: Record<string, unknown>;
};

export default function AdsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasIdea, setHasIdea] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: project } = await supabase
        .from("projects")
        .select("idea_summary")
        .eq("id", projectId)
        .single();

      setHasIdea(!!project?.idea_summary);

      const { data } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("project_id", projectId)
        .order("recommended", { ascending: false });

      setAds((data as unknown as AdCampaign[]) || []);
      setLoading(false);
    }
    load();
  }, [projectId]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAds(data);
    } catch {
      // Handle error
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <LoadingState message="Loading ads..." />;

  if (!hasIdea) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <EmptyState
          icon={Megaphone}
          title="Complete the AI Coach first"
          description="Define your idea with the AI Coach before generating ad content."
        />
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <EmptyState
          icon={Megaphone}
          title="Generate ad content"
          description="AI will create ready-to-use ad copy for Google, Facebook, Instagram, Reddit, and X."
          action={
            <Button onClick={handleGenerate} loading={generating}>
              <Sparkles className="h-4 w-4" />
              Generate ads
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ad Content</h2>
        <Button onClick={handleGenerate} loading={generating} variant="outline" size="sm">
          <Sparkles className="h-4 w-4" />
          Regenerate
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ads.map((ad) => (
          <AdPreviewCard
            key={ad.id}
            channel={ad.channel}
            recommended={ad.recommended}
            recommendationReason={ad.recommendation_reason}
            content={ad.content}
          />
        ))}
      </div>
    </div>
  );
}
