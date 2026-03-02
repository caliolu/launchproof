"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OpportunityDetail } from "@/components/scanner/opportunity-detail";
import { LoadingState } from "@/components/shared/loading-state";
import { ArrowLeft, Plus } from "lucide-react";
import type { Opportunity, RedditSignal, ReviewSignal } from "@/types/scanner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function OpportunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [signals, setSignals] = useState<{ reddit: RedditSignal[]; reviews: ReviewSignal[] }>({
    reddit: [],
    reviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [oppRes, sigRes] = await Promise.all([
          fetch(`/api/scanner/opportunities/${slug}`),
          fetch(`/api/scanner/opportunities/${slug}/signals`),
        ]);

        if (!oppRes.ok) {
          setError("Opportunity not found");
          setLoading(false);
          return;
        }

        const oppData = await oppRes.json();
        setOpportunity(oppData.opportunity);

        if (sigRes.ok) {
          const sigData = await sigRes.json();
          setSignals({
            reddit: sigData.reddit_signals || [],
            reviews: sigData.review_signals || [],
          });
        }
      } catch {
        setError("Failed to load opportunity");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleAnnotationChange = useCallback(
    async (data: { isFavorite?: boolean; status?: string; notes?: string }) => {
      if (!opportunity) return;

      await fetch("/api/scanner/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opportunity.id, ...data }),
      });

      // Optimistic update
      setOpportunity((prev) =>
        prev
          ? {
              ...prev,
              annotation: {
                ...(prev.annotation || {
                  id: "",
                  user_id: "",
                  opportunity_id: prev.id,
                  is_favorite: false,
                  status: "new" as const,
                  notes: null,
                  created_at: "",
                  updated_at: "",
                }),
                ...(data.isFavorite !== undefined ? { is_favorite: data.isFavorite } : {}),
                ...(data.status !== undefined ? { status: data.status as "new" } : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
              },
            }
          : prev
      );
    },
    [opportunity]
  );

  async function handleCreateProject() {
    if (!opportunity) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: opportunity.title }),
      });

      if (!res.ok) return;

      const { project } = await res.json();

      // Update project with opportunity data
      await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_statement: opportunity.problem_statement,
          target_audience: opportunity.target_audience,
          value_proposition: opportunity.description,
          industry: opportunity.category,
        }),
      });

      router.push(`/project/${project.id}/chat?idea=${encodeURIComponent(opportunity.description)}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  }

  if (loading) {
    return <LoadingState message="Loading opportunity..." />;
  }

  if (error || !opportunity) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">{error || "Not found"}</p>
        <Link href="/discover" className="text-primary hover:underline text-sm mt-2 inline-block">
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back + Create Project */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/discover"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </Link>
        <button
          onClick={handleCreateProject}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-purple-500 text-primary-foreground font-medium text-sm cursor-pointer hover:brightness-110 shadow-[var(--shadow-glow)] transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      <OpportunityDetail
        opportunity={opportunity}
        onAnnotationChange={handleAnnotationChange}
      />

      {/* Evidence: Supporting Signals */}
      {(signals.reddit.length > 0 || signals.reviews.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Supporting Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signals.reddit.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Reddit Signals ({signals.reddit.length})
                </h4>
                <div className="space-y-3">
                  {signals.reddit.map((signal) => (
                    <div key={signal.id} className="rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <a
                            href={signal.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:text-primary"
                          >
                            {signal.post_title}
                          </a>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            r/{signal.subreddit} &middot; Score: {signal.post_score}
                          </p>
                        </div>
                        <Badge variant={signal.opportunity_score && signal.opportunity_score >= 7 ? "success" : "secondary"}>
                          {signal.opportunity_score}/10
                        </Badge>
                      </div>
                      {signal.pain_point && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Pain: {signal.pain_point}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {signals.reviews.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Review Signals ({signals.reviews.length})
                </h4>
                <div className="space-y-3">
                  {signals.reviews.map((signal) => (
                    <div key={signal.id} className="rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{signal.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {signal.platform} &middot; {signal.rating}/5
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {signal.review_body}
                      </p>
                      {(signal.feature_gaps as string[] || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(signal.feature_gaps as string[]).map((gap) => (
                            <Badge key={gap} variant="outline" className="text-[10px]">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
