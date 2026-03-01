"use client";

import { useUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { getPlan } from "@/config/plans";

interface PlatformHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PlatformHeader({
  title,
  description,
  actions,
}: PlatformHeaderProps) {
  const { profile } = useUser();
  const plan = getPlan(profile?.plan || "free");

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{title}</h1>
            <Badge variant="secondary">{plan.name}</Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
