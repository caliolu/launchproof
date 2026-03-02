"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    onDelete?.(project.id);
  }

  return (
    <Link href={`/project/${project.id}`}>
      <Card className="hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 cursor-pointer">
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
                  className="p-1 rounded transition-colors cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Delete project"
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
                <span className={cn("flex items-center gap-1", project.validation_score > 70 && "text-success")}>
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
      {onDelete && (
        <ConfirmDialog
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Delete project"
          description={`"${project.name}" and all its data (landing page, signups, chat history) will be permanently deleted.`}
          confirmLabel="Delete"
          destructive
          loading={deleting}
        />
      )}
    </Link>
  );
}
