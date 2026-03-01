"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import { BarChart3, Globe, Trash2 } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    slug: string;
    status: string;
    validation_score: number | null;
    industry: string | null;
    created_at: string;
    updated_at: string;
  };
  onDelete?: (id: string) => void;
}

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary"> = {
  draft: "secondary",
  active: "success",
  paused: "warning",
  completed: "default",
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [confirming, setConfirming] = useState(false);

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirming) {
      onDelete?.(project.id);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  }

  return (
    <Link href={`/project/${project.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{project.name}</CardTitle>
              <CardDescription>
                {project.industry || "No industry set"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[project.status] || "secondary"}>
                {project.status}
              </Badge>
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    confirming
                      ? "text-destructive bg-destructive/10"
                      : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  }`}
                  title={confirming ? "Click again to confirm" : "Delete project"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {project.validation_score !== null && (
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {project.validation_score}/100
                </span>
              )}
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {project.slug}
              </span>
            </div>
            <span>{formatRelativeTime(project.updated_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
