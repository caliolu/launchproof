"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PlatformHeader } from "@/components/layout/platform-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Plus, Rocket } from "lucide-react";

type Project = {
  id: string;
  name: string;
  slug: string;
  status: string;
  validation_score: number | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("id, name, slug, status, validation_score, industry, created_at, updated_at")
        .order("updated_at", { ascending: false });
      setProjects((data as Project[]) || []);
      setLoading(false);
    }
    loadProjects();
  }, []);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <>
      <PlatformHeader
        title="Dashboard"
        description="Manage your validation tests"
        actions={
          <Link href="/project/new">
            <Button>
              <Plus className="h-4 w-4" />
              New project
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        {loading ? (
          <LoadingState message="Loading projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={Rocket}
            title="No projects yet"
            description="Create your first project to start validating your startup idea."
            action={
              <Link href="/project/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create project
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
