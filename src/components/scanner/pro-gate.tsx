"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

interface ProGateProps {
  feature?: string;
}

export function ProGate({ feature = "Market Research" }: ProGateProps) {
  return (
    <div className="relative">
      {/* Blurred background placeholder */}
      <div className="blur-sm opacity-30 pointer-events-none select-none">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 h-48" />
          ))}
        </div>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-card rounded-xl border border-border shadow-lg p-8 text-center max-w-sm mx-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{feature} is a Pro Feature</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Unlock market intelligence, opportunity scanning, and AI-powered product briefs
            to find your next SaaS idea.
          </p>
          <Link
            href="/settings/billing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
