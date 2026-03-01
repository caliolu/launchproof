"use client";

import { useParams } from "next/navigation";
import { useProject } from "@/hooks/use-project";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Eye, TrendingUp } from "lucide-react";

export default function ProjectDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, loading } = useProject(projectId);

  if (loading) return <LoadingState message="Loading project..." />;
  if (!project) return <div className="p-6">Project not found.</div>;

  const score = project.validation_score;
  const hasScore = score !== null && score !== undefined;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-sm text-muted-foreground">
            {project.value_proposition || "Start by chatting with the AI Coach to define your idea."}
          </p>
        </div>
        <Badge variant={project.status === "active" ? "success" : "secondary"}>
          {project.status}
        </Badge>
      </div>

      {/* Validation Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validation Score</CardTitle>
        </CardHeader>
        <CardContent>
          {hasScore ? (
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${score * 2.64} 264`}
                    strokeLinecap="round"
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{score}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {score >= 70
                  ? "Strong signal! Your idea has good traction."
                  : score >= 40
                    ? "Mixed signals. Consider iterating on your messaging."
                    : score > 0
                      ? "Early data coming in. Keep driving traffic for more accurate results."
                      : "No conversions yet. Keep driving traffic to your landing page."}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No data yet. Publish your landing page and drive traffic to see your validation score.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Page Views", value: "0", icon: Eye },
          { label: "Unique Visitors", value: "0", icon: Users },
          { label: "Signups", value: "0", icon: TrendingUp },
          { label: "Conversion", value: "0%", icon: BarChart3 },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <metric.icon className="h-4 w-4" />
                {metric.label}
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
