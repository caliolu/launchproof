"use client";

import { OPPORTUNITY_CATEGORIES } from "@/config/scanner";
import { Search, SlidersHorizontal } from "lucide-react";

interface OpportunityFiltersProps {
  category: string;
  onCategoryChange: (category: string) => void;
  minScore: string;
  onMinScoreChange: (score: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function OpportunityFilters({
  category,
  onCategoryChange,
  minScore,
  onMinScoreChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
}: OpportunityFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Categories</option>
          {OPPORTUNITY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={minScore}
          onChange={(e) => onMinScoreChange(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Any Score</option>
          <option value="70">70+ (Strong)</option>
          <option value="50">50+ (Moderate)</option>
          <option value="40">40+ (All viable)</option>
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="composite_score">Score (High to Low)</option>
          <option value="created_at">Newest First</option>
          <option value="demand_score">Demand</option>
          <option value="wtp_score">Willingness to Pay</option>
        </select>
      </div>
    </div>
  );
}
