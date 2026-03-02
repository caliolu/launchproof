-- ============================================================
-- Phase 2: SaaS Opportunity Scanner
-- Tables: scan_jobs, reddit_signals, review_signals,
--         opportunities, opportunity_signals,
--         opportunity_annotations, project_market_research
-- ============================================================

-- Scan Jobs: tracks each user-triggered scan
CREATE TABLE public.scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('reddit', 'reviews', 'full')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'partial')),
  config JSONB NOT NULL DEFAULT '{}',
  results_summary JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scan_jobs_user ON public.scan_jobs(user_id);
CREATE INDEX idx_scan_jobs_status ON public.scan_jobs(status);

-- Reddit Demand Signals
CREATE TABLE public.reddit_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_job_id UUID NOT NULL REFERENCES public.scan_jobs(id) ON DELETE CASCADE,
  subreddit TEXT NOT NULL,
  post_id TEXT NOT NULL UNIQUE,
  post_title TEXT NOT NULL,
  post_body TEXT,
  post_url TEXT NOT NULL,
  post_score INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  post_created_at TIMESTAMPTZ,
  category TEXT,
  pain_point TEXT,
  desired_features JSONB,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  willingness_to_pay TEXT CHECK (willingness_to_pay IN ('none', 'low', 'medium', 'high')),
  budget_range TEXT,
  opportunity_score INTEGER CHECK (opportunity_score >= 1 AND opportunity_score <= 10),
  analysis_raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reddit_signals_scan ON public.reddit_signals(scan_job_id);
CREATE INDEX idx_reddit_signals_subreddit ON public.reddit_signals(subreddit);
CREATE INDEX idx_reddit_signals_score ON public.reddit_signals(opportunity_score);

-- Review Signals
CREATE TABLE public.review_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_job_id UUID NOT NULL REFERENCES public.scan_jobs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('g2', 'capterra', 'producthunt', 'trustpilot')),
  product_name TEXT NOT NULL,
  reviewer_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_body TEXT NOT NULL,
  review_url TEXT,
  review_date TIMESTAMPTZ,
  weakness_clusters JSONB,
  feature_gaps JSONB,
  churn_reasons JSONB,
  affected_segment TEXT,
  analysis_raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_signals_scan ON public.review_signals(scan_job_id);
CREATE INDEX idx_review_signals_platform ON public.review_signals(platform);

-- Opportunities: cross-referenced and scored
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_job_id UUID REFERENCES public.scan_jobs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  composite_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  demand_score NUMERIC(5,2) DEFAULT 0,
  weakness_score NUMERIC(5,2) DEFAULT 0,
  frequency_score NUMERIC(5,2) DEFAULT 0,
  wtp_score NUMERIC(5,2) DEFAULT 0,
  feasibility_score NUMERIC(5,2) DEFAULT 0,
  problem_statement TEXT,
  target_audience TEXT,
  must_have_features JSONB,
  suggested_pricing TEXT,
  gtm_strategy TEXT,
  competing_products JSONB,
  product_brief JSONB,
  reddit_signal_count INTEGER DEFAULT 0,
  review_signal_count INTEGER DEFAULT 0,
  industries JSONB,
  tags JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_opportunities_score ON public.opportunities(composite_score DESC);
CREATE INDEX idx_opportunities_category ON public.opportunities(category);
CREATE INDEX idx_opportunities_slug ON public.opportunities(slug);

-- Junction: signals → opportunities
CREATE TABLE public.opportunity_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('reddit', 'review')),
  signal_id UUID NOT NULL,
  relevance_score NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(opportunity_id, signal_type, signal_id)
);

CREATE INDEX idx_opportunity_signals_opp ON public.opportunity_signals(opportunity_id);

-- User Annotations: favorites, notes, status per user
CREATE TABLE public.opportunity_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'researching', 'validated', 'building', 'dismissed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX idx_annotations_user ON public.opportunity_annotations(user_id);
CREATE INDEX idx_annotations_favorite ON public.opportunity_annotations(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Project Market Research: per-project relevance analysis
CREATE TABLE public.project_market_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  relevance_score NUMERIC(5,2) DEFAULT 0,
  relevance_explanation TEXT,
  market_fit_analysis JSONB,
  competitive_advantages JSONB,
  risks JSONB,
  recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, opportunity_id)
);

CREATE INDEX idx_market_research_project ON public.project_market_research(project_id);

-- ============================================================
-- Updated-at triggers (reuse existing function from 00003)
-- ============================================================
CREATE TRIGGER set_scan_jobs_updated_at
  BEFORE UPDATE ON public.scan_jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_annotations_updated_at
  BEFORE UPDATE ON public.opportunity_annotations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_market_research_updated_at
  BEFORE UPDATE ON public.project_market_research
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_market_research ENABLE ROW LEVEL SECURITY;

-- Scan jobs: visible to creator only
CREATE POLICY "Users can view own scan jobs"
  ON public.scan_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scan jobs"
  ON public.scan_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Shared data: readable by all authenticated users
CREATE POLICY "Authenticated users can view reddit signals"
  ON public.reddit_signals FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view review signals"
  ON public.review_signals FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view opportunity signals"
  ON public.opportunity_signals FOR SELECT
  USING (auth.role() = 'authenticated');

-- Annotations: per-user CRUD
CREATE POLICY "Users can view own annotations"
  ON public.opportunity_annotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own annotations"
  ON public.opportunity_annotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own annotations"
  ON public.opportunity_annotations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own annotations"
  ON public.opportunity_annotations FOR DELETE
  USING (auth.uid() = user_id);

-- Market research: accessible by project owner
CREATE POLICY "Users can view own project market research"
  ON public.project_market_research FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_market_research.project_id
      AND projects.user_id = auth.uid()
    )
  );
