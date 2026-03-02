"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Star, TrendingUp } from "lucide-react";
import type { Opportunity } from "@/types/scanner";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onToggleFavorite?: (id: string, current: boolean) => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-muted-foreground";
}

function scoreBadgeVariant(score: number): "success" | "warning" | "secondary" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "secondary";
}

export function OpportunityCard({ opportunity, onToggleFavorite }: OpportunityCardProps) {
  const isFavorite = opportunity.annotation?.is_favorite ?? false;

  return (
    <Card className="hover:border-primary/50 transition-colors group">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/discover/${opportunity.slug}`}>
              <CardTitle className="text-base group-hover:text-primary transition-colors cursor-pointer">
                {opportunity.title}
              </CardTitle>
            </Link>
            <CardDescription className="mt-1 line-clamp-2">
              {opportunity.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={scoreBadgeVariant(opportunity.composite_score)}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {Math.round(opportunity.composite_score)}
            </Badge>
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite(opportunity.id, isFavorite);
                }}
                className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-accent"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline">{opportunity.category}</Badge>
          {(opportunity.tags as string[] || []).slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {opportunity.reddit_signal_count} Reddit
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {opportunity.review_signal_count} Reviews
          </span>
          <span className={`ml-auto font-medium ${scoreColor(opportunity.composite_score)}`}>
            {opportunity.composite_score >= 70
              ? "Strong opportunity"
              : opportunity.composite_score >= 40
                ? "Moderate signal"
                : "Early signal"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
