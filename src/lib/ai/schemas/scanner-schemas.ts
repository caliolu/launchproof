import { z } from "zod";

export const redditAnalysisSchema = z.object({
  posts: z.array(
    z.object({
      post_id: z.string(),
      category: z.string(),
      pain_point: z.string(),
      desired_features: z.array(z.string()).default([]),
      urgency: z.enum(["low", "medium", "high", "critical"]),
      willingness_to_pay: z.enum(["none", "low", "medium", "high"]),
      budget_range: z.string().optional(),
      opportunity_score: z.number().min(1).max(10),
      reasoning: z.string(),
    })
  ),
});

export type RedditAnalysisOutput = z.infer<typeof redditAnalysisSchema>;

export const reviewAnalysisSchema = z.object({
  reviews: z.array(
    z.object({
      review_index: z.number(),
      weakness_clusters: z.array(z.string()).default([]),
      feature_gaps: z.array(z.string()).default([]),
      churn_reasons: z.array(z.string()).default([]),
      affected_segment: z.string(),
      severity: z.enum(["minor", "moderate", "major", "critical"]),
      reasoning: z.string(),
    })
  ),
});

export type ReviewAnalysisOutput = z.infer<typeof reviewAnalysisSchema>;

export const opportunitySynthesisSchema = z.object({
  opportunities: z.array(
    z.object({
      title: z.string().min(5).max(120),
      description: z.string().min(20).max(500),
      category: z.string(),
      demand_score: z.number().min(0).max(100),
      weakness_score: z.number().min(0).max(100),
      frequency_score: z.number().min(0).max(100),
      wtp_score: z.number().min(0).max(100),
      feasibility_score: z.number().min(0).max(100),
      problem_statement: z.string(),
      target_audience: z.string(),
      must_have_features: z.array(z.string()).min(1).max(8),
      suggested_pricing: z.string(),
      gtm_strategy: z.string(),
      competing_products: z.array(
        z.object({
          name: z.string(),
          weakness: z.string(),
          url: z.string().optional(),
        })
      ).default([]),
      industries: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      supporting_signal_ids: z.array(z.string()).default([]),
    })
  ),
});

export type OpportunitySynthesisOutput = z.infer<typeof opportunitySynthesisSchema>;

export const productBriefSchema = z.object({
  executive_summary: z.string(),
  problem_deep_dive: z.string(),
  target_personas: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      pain_points: z.array(z.string()),
      willingness_to_pay: z.string(),
    })
  ).min(1).max(4),
  mvp_features: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      priority: z.enum(["must-have", "nice-to-have"]),
    })
  ).min(2).max(10),
  pricing_strategy: z.string(),
  go_to_market: z.string(),
  competitive_landscape: z.string(),
  risks_and_mitigations: z.array(
    z.object({
      risk: z.string(),
      mitigation: z.string(),
    })
  ).min(1).max(6),
  success_metrics: z.array(z.string()).min(2).max(8),
});

export type ProductBriefOutput = z.infer<typeof productBriefSchema>;

export const marketFitSchema = z.object({
  results: z.array(
    z.object({
      opportunity_id: z.string(),
      relevance_score: z.number().min(0).max(100),
      relevance_explanation: z.string(),
      fit_level: z.enum(["strong", "partial", "weak"]),
      overlap_areas: z.array(z.string()),
      differentiation_opportunities: z.array(z.string()),
      market_size_indicator: z.string(),
      competitive_advantages: z.array(z.string()),
      risks: z.array(z.string()),
      recommendation: z.string(),
    })
  ),
});

export type MarketFitOutput = z.infer<typeof marketFitSchema>;
