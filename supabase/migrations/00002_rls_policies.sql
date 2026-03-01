-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions: users can read own
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Projects: full CRUD for owner
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Chat Sessions: owner only
CREATE POLICY "Users can view own chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Chat Messages: owner only (via session)
CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_messages.session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_messages.session_id
      AND user_id = auth.uid()
    )
  );

-- Landing Pages: owner CRUD + public read for published
CREATE POLICY "Users can view own landing pages"
  ON public.landing_pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view published landing pages"
  ON public.landing_pages FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Users can create landing pages"
  ON public.landing_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own landing pages"
  ON public.landing_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own landing pages"
  ON public.landing_pages FOR DELETE
  USING (auth.uid() = user_id);

-- Ad Campaigns: owner only
CREATE POLICY "Users can view own ad campaigns"
  ON public.ad_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create ad campaigns"
  ON public.ad_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ad campaigns"
  ON public.ad_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ad campaigns"
  ON public.ad_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Signups: public insert (on published pages) + owner read
CREATE POLICY "Public can create signups on published pages"
  ON public.signups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.landing_pages
      WHERE id = signups.landing_page_id
      AND is_published = TRUE
    )
  );

CREATE POLICY "Users can view signups for own projects"
  ON public.signups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = signups.project_id
      AND user_id = auth.uid()
    )
  );

-- Page Views: public insert (on published pages) + owner read
CREATE POLICY "Public can create page views on published pages"
  ON public.page_views FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.landing_pages
      WHERE id = page_views.landing_page_id
      AND is_published = TRUE
    )
  );

CREATE POLICY "Users can view page views for own projects"
  ON public.page_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = page_views.project_id
      AND user_id = auth.uid()
    )
  );

-- Email Logs: owner read only
CREATE POLICY "Users can view own email logs"
  ON public.email_logs FOR SELECT
  USING (auth.uid() = user_id);
