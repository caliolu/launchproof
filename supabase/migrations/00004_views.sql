-- Daily analytics view: aggregates page_views + signups by day per project
CREATE OR REPLACE VIEW public.daily_analytics AS
SELECT
  pv.project_id,
  DATE(pv.viewed_at) AS date,
  COUNT(DISTINCT pv.id) AS page_views,
  COUNT(DISTINCT pv.session_id) AS unique_visitors,
  COUNT(DISTINCT s.id) AS signups,
  CASE
    WHEN COUNT(DISTINCT pv.session_id) > 0
    THEN ROUND(COUNT(DISTINCT s.id)::NUMERIC / COUNT(DISTINCT pv.session_id) * 100, 2)
    ELSE 0
  END AS conversion_rate
FROM public.page_views pv
LEFT JOIN public.signups s
  ON s.project_id = pv.project_id
  AND DATE(s.created_at) = DATE(pv.viewed_at)
GROUP BY pv.project_id, DATE(pv.viewed_at)
ORDER BY date DESC;
