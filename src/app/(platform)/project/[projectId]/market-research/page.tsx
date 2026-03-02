"use client";

import { useParams } from "next/navigation";
import { useMarketResearch } from "@/hooks/use-market-research";
import { useSubscription } from "@/hooks/use-subscription";
import { useProject } from "@/hooks/use-project";
import { ProGate } from "@/components/scanner/pro-gate";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Radar, MessageSquare, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import type { MarketFitAnalysis } from "@/types/scanner";

function fitBadgeVariant(level: string): "success" | "warning" | "secondary" {
  if (level === "strong") return "success";
  if (level === "partial") return "warning";
  return "secondary";
}

export default function MarketResearchPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { plan, loading: planLoading } = useSubscription();
  const { project, loading: projectLoading } = useProject(projectId);
  const { results, loading, analyzing, error, triggerAnalysis } = useMarketResearch(projectId);

  if (planLoading || projectLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (plan !== "pro") {
    return (
      <div className="p-6">
        <ProGate feature="Market Research" />
      </div>
    );
  }

  // Check if idea summary exists
  if (!project?.idea_summary) {
    return (
      <div className="p-6">
        <EmptyState
          icon={MessageSquare}
          title="Complete AI Coach First"
          description="The Market Research tab analyzes how market opportunities relate to your specific idea. Complete the AI Coach conversation to generate your idea summary first."
          action={
            <Link
              href={`/project/${projectId}/chat`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90"
            >
              <MessageSquare className="h-4 w-4" />
              Go to AI Coach
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Market Research</h1>
          <p className="text-sm text-muted-foreground mt-1">
            How existing market opportunities relate to your idea
          </p>
        </div>
        <button
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm cursor-pointer hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Radar className="h-4 w-4" />
              Analyze Market
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading market research..." />
      ) : results.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No market research yet"
          description='Click "Analyze Market" to find how existing market opportunities relate to your idea. Make sure there are scanned opportunities in the Discover page first.'
          action={
            <Link
              href="/discover"
              className="text-sm text-primary hover:underline"
            >
              Go to Discover page
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="flex flex-wrap gap-3 mb-2">
            <Badge variant="success">
              {results.filter((r) => {
                const analysis = r.market_fit_analysis as MarketFitAnalysis | null;
                return analysis?.fit_level === "strong";
              }).length} Strong Fit
            </Badge>
            <Badge variant="warning">
              {results.filter((r) => {
                const analysis = r.market_fit_analysis as MarketFitAnalysis | null;
                return analysis?.fit_level === "partial";
              }).length} Partial Fit
            </Badge>
            <Badge variant="secondary">
              {results.filter((r) => {
                const analysis = r.market_fit_analysis as MarketFitAnalysis | null;
                return analysis?.fit_level === "weak";
              }).length} Weak Fit
            </Badge>
          </div>

          {/* Results */}
          {results.map((result) => {
            const opp = result.opportunity;
            const analysis = result.market_fit_analysis as MarketFitAnalysis | null;
            const advantages = result.competitive_advantages as string[] | null;
            const risks = result.risks as string[] | null;

            return (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {opp ? (
                          <Link
                            href={`/discover/${(opp as { slug?: string }).slug || ""}`}
                            className="hover:text-primary"
                          >
                            {(opp as { title?: string }).title}
                          </Link>
                        ) : (
                          "Unknown Opportunity"
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Relevance: {Math.round(result.relevance_score)}%
                      </p>
                    </div>
                    {analysis?.fit_level && (
                      <Badge variant={fitBadgeVariant(analysis.fit_level)}>
                        {analysis.fit_level} fit
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.relevance_explanation && (
                    <p className="text-sm text-muted-foreground">{result.relevance_explanation}</p>
                  )}

                  {analysis?.overlap_areas && analysis.overlap_areas.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium">Overlap Areas</p>
                        <p className="text-xs text-muted-foreground">{analysis.overlap_areas.join(", ")}</p>
                      </div>
                    </div>
                  )}

                  {advantages && advantages.length > 0 && (
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium">Your Advantages</p>
                        <p className="text-xs text-muted-foreground">{advantages.join(", ")}</p>
                      </div>
                    </div>
                  )}

                  {risks && risks.length > 0 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium">Risks</p>
                        <p className="text-xs text-muted-foreground">{risks.join(", ")}</p>
                      </div>
                    </div>
                  )}

                  {result.recommendation && (
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-medium mb-1">Recommendation</p>
                      <p className="text-xs text-muted-foreground">{result.recommendation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
