"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { ValidationScore } from "@/components/dashboard/validation-score";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { TrafficChart } from "@/components/dashboard/traffic-chart";
import { SignupTable } from "@/components/dashboard/signup-table";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { BarChart3, Download } from "lucide-react";
import type { ProjectMetrics, AnalyticsPeriod } from "@/types/analytics";

const periodTabs = [
  { label: "7 days", value: "7d" },
  { label: "14 days", value: "14d" },
  { label: "30 days", value: "30d" },
  { label: "All time", value: "all" },
];

export default function AnalyticsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [score, setScore] = useState<{ total: number; conversion: number; traffic: number; engagement: number; quality: number } | null>(null);
  const [signups, setSignups] = useState<Array<{ id: string; email: string; name: string | null; source: string | null; ip_country: string | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [analyticsRes, signupsRes] = await Promise.all([
        fetch(`/api/analytics/${projectId}?period=${period}`),
        fetch(`/api/signups/${projectId}`),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setMetrics(data.metrics);
        setScore(data.score);
      }

      if (signupsRes.ok) {
        setSignups(await signupsRes.json());
      }

      setLoading(false);
    }
    load();
  }, [projectId, period]);

  if (loading) return <LoadingState message="Loading analytics..." />;

  if (!metrics || metrics.totalPageViews === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <EmptyState
          icon={BarChart3}
          title="No analytics data yet"
          description="Publish your landing page and drive traffic to see analytics here."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <div className="flex items-center gap-3">
          <Tabs
            tabs={periodTabs}
            activeTab={period}
            onChange={(v) => setPeriod(v as AnalyticsPeriod)}
          />
          <a href={`/api/signups/${projectId}?format=csv`} download>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </a>
        </div>
      </div>

      {score && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Validation Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ValidationScore score={score.total} breakdown={score} />
          </CardContent>
        </Card>
      )}

      <MetricsGrid
        pageViews={metrics.totalPageViews}
        uniqueVisitors={metrics.totalUniqueVisitors}
        signups={metrics.totalSignups}
        conversionRate={metrics.conversionRate}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Traffic & Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <TrafficChart data={metrics.dailyMetrics} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signups ({signups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SignupTable signups={signups} />
        </CardContent>
      </Card>
    </div>
  );
}
