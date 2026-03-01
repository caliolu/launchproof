"use client";

import { useParams } from "next/navigation";
import { ProjectTabs } from "@/components/layout/project-tabs";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="flex flex-col flex-1">
      <ProjectTabs projectId={projectId} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
