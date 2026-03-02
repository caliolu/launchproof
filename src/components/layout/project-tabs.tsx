"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { projectTabs } from "@/config/navigation";

interface ProjectTabsProps {
  projectId: string;
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname();
  const basePath = `/project/${projectId}`;

  return (
    <nav className="border-b border-border bg-card px-6 overflow-x-auto scrollbar-none">
      <div className="flex gap-1 -mb-px min-w-max">
        {projectTabs.map((tab) => {
          const href = `${basePath}${tab.href}`;
          const isActive =
            tab.href === ""
              ? pathname === basePath
              : pathname.startsWith(href);

          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
