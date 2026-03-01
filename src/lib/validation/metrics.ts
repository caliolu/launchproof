import { createClient } from "@/lib/supabase/server";
import type { ProjectMetrics, DailyMetric } from "@/types/analytics";

export async function getProjectMetrics(
  projectId: string,
  days: number = 30
): Promise<ProjectMetrics> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  const [
    { data: pageViews },
    { data: signups },
    { count: totalViews },
    { count: totalSignups },
  ] = await Promise.all([
    supabase
      .from("page_views")
      .select("*")
      .eq("project_id", projectId)
      .gte("viewed_at", sinceStr),
    supabase
      .from("signups")
      .select("*")
      .eq("project_id", projectId)
      .gte("created_at", sinceStr),
    supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .gte("viewed_at", sinceStr),
    supabase
      .from("signups")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .gte("created_at", sinceStr),
  ]);

  const pvCount = totalViews || 0;
  const suCount = totalSignups || 0;
  const uniqueSessions = new Set(pageViews?.map((pv) => pv.session_id).filter(Boolean)).size;
  const conversionRate = uniqueSessions > 0 ? (suCount / uniqueSessions) * 100 : 0;

  // Group by day
  const dailyMap = new Map<string, DailyMetric>();
  for (const pv of pageViews || []) {
    const date = pv.viewed_at.split("T")[0];
    const existing = dailyMap.get(date) || {
      date,
      pageViews: 0,
      uniqueVisitors: 0,
      signups: 0,
      conversionRate: 0,
    };
    existing.pageViews++;
    dailyMap.set(date, existing);
  }
  for (const su of signups || []) {
    const date = su.created_at.split("T")[0];
    const existing = dailyMap.get(date) || {
      date,
      pageViews: 0,
      uniqueVisitors: 0,
      signups: 0,
      conversionRate: 0,
    };
    existing.signups++;
    dailyMap.set(date, existing);
  }

  // Top sources
  const sourceMap = new Map<string, number>();
  for (const pv of pageViews || []) {
    const src = pv.source || "Direct";
    sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
  }
  const topSources = [...sourceMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Device breakdown
  const deviceMap = new Map<string, number>();
  for (const pv of pageViews || []) {
    const device = pv.device_type || "unknown";
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
  }
  const deviceBreakdown = [...deviceMap.entries()]
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  // Top countries
  const countryMap = new Map<string, number>();
  for (const pv of pageViews || []) {
    const country = pv.ip_country || "Unknown";
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
  }
  const topCountries = [...countryMap.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalPageViews: pvCount,
    totalUniqueVisitors: uniqueSessions,
    totalSignups: suCount,
    conversionRate: Math.round(conversionRate * 100) / 100,
    topSources,
    topCountries,
    deviceBreakdown,
    dailyMetrics: [...dailyMap.values()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
  };
}
