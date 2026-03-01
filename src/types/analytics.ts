export interface DailyMetric {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  signups: number;
  conversionRate: number;
}

export interface ProjectMetrics {
  totalPageViews: number;
  totalUniqueVisitors: number;
  totalSignups: number;
  conversionRate: number;
  avgTimeOnPage?: number;
  bounceRate?: number;
  topSources: { source: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  dailyMetrics: DailyMetric[];
}

export type AnalyticsPeriod = "7d" | "14d" | "30d" | "all";
