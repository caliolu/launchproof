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
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{title}</h1>
            {plan.name === "Pro" ? (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent border border-primary/20">
                {plan.name}
              </span>
            ) : (
              <Badge variant="secondary">{plan.name}</Badge>
            )}
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
