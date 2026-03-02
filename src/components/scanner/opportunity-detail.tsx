"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBreakdown } from "./score-breakdown";
import { AnnotationControls } from "./annotation-controls";
import { Target, Users, DollarSign, Rocket, Swords, Lightbulb } from "lucide-react";
import type { Opportunity, ProductBrief } from "@/types/scanner";

interface OpportunityDetailProps {
  opportunity: Opportunity;
  onAnnotationChange?: (data: { isFavorite?: boolean; status?: string; notes?: string }) => void;
}

export function OpportunityDetail({ opportunity, onAnnotationChange }: OpportunityDetailProps) {
  const brief = opportunity.product_brief as ProductBrief | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline">{opportunity.category}</Badge>
          {(opportunity.industries as string[] || []).map((ind) => (
            <Badge key={ind} variant="secondary">{ind}</Badge>
          ))}
        </div>
        <h1 className="text-2xl font-bold mb-2">{opportunity.title}</h1>
        <p className="text-muted-foreground">{opportunity.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <ScoreBreakdown
              demand={opportunity.demand_score}
              weakness={opportunity.weakness_score}
              frequency={opportunity.frequency_score}
              wtp={opportunity.wtp_score}
              feasibility={opportunity.feasibility_score}
              composite={opportunity.composite_score}
            />
          </CardContent>
        </Card>

        {/* Key Details */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Problem</p>
                  <p className="text-sm text-muted-foreground">{opportunity.problem_statement}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Target Audience</p>
                  <p className="text-sm text-muted-foreground">{opportunity.target_audience}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <DollarSign className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Suggested Pricing</p>
                  <p className="text-sm text-muted-foreground">{opportunity.suggested_pricing}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Rocket className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Go-to-Market</p>
                  <p className="text-sm text-muted-foreground">{opportunity.gtm_strategy}</p>
                </div>
              </div>
            </div>

            {/* Must-have features */}
            {opportunity.must_have_features && (
              <div className="flex gap-3">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-2">Must-Have Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(opportunity.must_have_features as string[]).map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Competitors */}
            {opportunity.competing_products && (opportunity.competing_products as Array<{ name: string; weakness: string }>).length > 0 && (
              <div className="flex gap-3">
                <Swords className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-2">Competitors</p>
                  <div className="space-y-1">
                    {(opportunity.competing_products as Array<{ name: string; weakness: string }>).map((c) => (
                      <p key={c.name} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{c.name}</span> — {c.weakness}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Brief */}
      {brief && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-1">Executive Summary</h4>
              <p className="text-sm text-muted-foreground">{brief.executive_summary}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-1">Problem Deep Dive</h4>
              <p className="text-sm text-muted-foreground">{brief.problem_deep_dive}</p>
            </div>

            {brief.target_personas?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Target Personas</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {brief.target_personas.map((p) => (
                    <div key={p.name} className="rounded-lg border border-border p-3">
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">WTP: {p.willingness_to_pay}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {brief.mvp_features?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">MVP Features</h4>
                <div className="space-y-2">
                  {brief.mvp_features.map((f) => (
                    <div key={f.name} className="flex items-start gap-2">
                      <Badge variant={f.priority === "must-have" ? "default" : "secondary"} className="text-[10px] mt-0.5 shrink-0">
                        {f.priority}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-1">Pricing Strategy</h4>
              <p className="text-sm text-muted-foreground">{brief.pricing_strategy}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-1">Go-to-Market</h4>
              <p className="text-sm text-muted-foreground">{brief.go_to_market}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-1">Competitive Landscape</h4>
              <p className="text-sm text-muted-foreground">{brief.competitive_landscape}</p>
            </div>

            {brief.risks_and_mitigations?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Risks & Mitigations</h4>
                <div className="space-y-2">
                  {brief.risks_and_mitigations.map((r, i) => (
                    <div key={i} className="text-sm">
                      <p className="text-muted-foreground"><span className="font-medium text-foreground">Risk:</span> {r.risk}</p>
                      <p className="text-muted-foreground"><span className="font-medium text-foreground">Mitigation:</span> {r.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {brief.success_metrics?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Success Metrics</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {brief.success_metrics.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Annotation Controls */}
      <AnnotationControls
        annotation={opportunity.annotation || null}
        onUpdate={onAnnotationChange}
      />
    </div>
  );
}
