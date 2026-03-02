export type ScanType = "reddit" | "reviews" | "full";
export type ScanStatus = "pending" | "running" | "completed" | "failed" | "partial";
export type Urgency = "low" | "medium" | "high" | "critical";
export type WillingnessToPay = "none" | "low" | "medium" | "high";
export type ReviewPlatform = "g2" | "capterra" | "producthunt" | "trustpilot";
export type AnnotationStatus = "new" | "researching" | "validated" | "building" | "dismissed";

export interface ScanJob {
  id: string;
  user_id: string;
  project_id: string | null;
  scan_type: ScanType;
  status: ScanStatus;
  config: ScanConfig;
  results_summary: ScanResultsSummary | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScanConfig {
  keywords?: string[];
  subreddits?: string[];
  platforms?: ReviewPlatform[];
  competitors?: string[];
  limit?: number;
}

export interface ScanResultsSummary {
  reddit_posts_found: number;
  reddit_posts_analyzed: number;
  reviews_found: number;
  reviews_analyzed: number;
  opportunities_generated: number;
  errors?: string[];
}

export interface RedditSignal {
  id: string;
  scan_job_id: string;
  subreddit: string;
  post_id: string;
  post_title: string;
  post_body: string | null;
  post_url: string;
  post_score: number;
  comment_count: number;
  post_created_at: string | null;
  category: string | null;
  pain_point: string | null;
  desired_features: string[] | null;
  urgency: Urgency | null;
  willingness_to_pay: WillingnessToPay | null;
  budget_range: string | null;
  opportunity_score: number | null;
  analysis_raw: Record<string, unknown> | null;
  created_at: string;
}

export interface ReviewSignal {
  id: string;
  scan_job_id: string;
  platform: ReviewPlatform;
  product_name: string;
  reviewer_name: string | null;
  rating: number | null;
  review_title: string | null;
  review_body: string;
  review_url: string | null;
  review_date: string | null;
  weakness_clusters: string[] | null;
  feature_gaps: string[] | null;
  churn_reasons: string[] | null;
  affected_segment: string | null;
  analysis_raw: Record<string, unknown> | null;
  created_at: string;
}

export interface Opportunity {
  id: string;
  scan_job_id: string | null;
  title: string;
  slug: string;
  description: string;
  category: string;
  composite_score: number;
  demand_score: number;
  weakness_score: number;
  frequency_score: number;
  wtp_score: number;
  feasibility_score: number;
  problem_statement: string | null;
  target_audience: string | null;
  must_have_features: string[] | null;
  suggested_pricing: string | null;
  gtm_strategy: string | null;
  competing_products: CompetingProduct[] | null;
  product_brief: ProductBrief | null;
  reddit_signal_count: number;
  review_signal_count: number;
  industries: string[] | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  annotation?: OpportunityAnnotation | null;
}

export interface CompetingProduct {
  name: string;
  weakness: string;
  url?: string;
}

export interface ProductBrief {
  executive_summary: string;
  problem_deep_dive: string;
  target_personas: TargetPersona[];
  mvp_features: MvpFeature[];
  pricing_strategy: string;
  go_to_market: string;
  competitive_landscape: string;
  risks_and_mitigations: RiskItem[];
  success_metrics: string[];
}

export interface TargetPersona {
  name: string;
  description: string;
  pain_points: string[];
  willingness_to_pay: string;
}

export interface MvpFeature {
  name: string;
  description: string;
  priority: "must-have" | "nice-to-have";
}

export interface RiskItem {
  risk: string;
  mitigation: string;
}

export interface OpportunityAnnotation {
  id: string;
  user_id: string;
  opportunity_id: string;
  is_favorite: boolean;
  status: AnnotationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunitySignal {
  id: string;
  opportunity_id: string;
  signal_type: "reddit" | "review";
  signal_id: string;
  relevance_score: number;
  created_at: string;
}

export interface MarketResearchResult {
  id: string;
  project_id: string;
  opportunity_id: string | null;
  relevance_score: number;
  relevance_explanation: string | null;
  market_fit_analysis: MarketFitAnalysis | null;
  competitive_advantages: string[] | null;
  risks: string[] | null;
  recommendation: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  opportunity?: Opportunity | null;
}

export interface MarketFitAnalysis {
  fit_level: "strong" | "partial" | "weak";
  overlap_areas: string[];
  differentiation_opportunities: string[];
  market_size_indicator: string;
}

// SSE event types for scan progress
export interface ScanProgressEvent {
  type: "status" | "progress" | "result" | "error" | "done";
  status?: ScanStatus;
  message?: string;
  step?: string;
  current?: number;
  total?: number;
  data?: unknown;
}
