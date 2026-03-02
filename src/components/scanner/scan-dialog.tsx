"use client";

import { useState } from "react";
import { DEFAULT_SUBREDDITS, DEFAULT_SEARCH_PATTERNS, REVIEW_PLATFORMS } from "@/config/scanner";
import { Radar, X } from "lucide-react";
import type { ScanType, ReviewPlatform } from "@/types/scanner";

interface ScanDialogProps {
  open: boolean;
  onClose: () => void;
  onStartScan: (config: {
    scanType: ScanType;
    keywords: string[];
    subreddits: string[];
    platforms: ReviewPlatform[];
    competitors: string[];
  }) => void;
  loading?: boolean;
}

export function ScanDialog({ open, onClose, onStartScan, loading }: ScanDialogProps) {
  const [scanType, setScanType] = useState<ScanType>("full");
  const [keywords, setKeywords] = useState("");
  const [customSubreddits, setCustomSubreddits] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [platforms, setPlatforms] = useState<ReviewPlatform[]>(["g2", "capterra", "producthunt", "trustpilot"]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const subredditList = customSubreddits
      .split(",")
      .map((s) => s.trim().replace(/^r\//, ""))
      .filter(Boolean);

    const competitorList = competitors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    onStartScan({
      scanType,
      keywords: keywordList.length > 0 ? keywordList : DEFAULT_SEARCH_PATTERNS.slice(0, 5),
      subreddits: subredditList.length > 0 ? subredditList : DEFAULT_SUBREDDITS,
      platforms,
      competitors: competitorList,
    });
  }

  function togglePlatform(platform: ReviewPlatform) {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border border-border shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">New Market Scan</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Scan Type */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Scan Type</label>
            <div className="flex gap-2">
              {(["full", "reddit", "reviews"] as ScanType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setScanType(type)}
                  className={`px-3 py-1.5 rounded-lg border text-sm capitalize cursor-pointer transition-colors ${
                    scanType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {type === "full" ? "Full Scan" : type === "reddit" ? "Reddit Only" : "Reviews Only"}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Keywords</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder='e.g., "project management", "CRM alternative"'
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated. Leave blank for default search patterns.</p>
          </div>

          {/* Subreddits */}
          {(scanType === "reddit" || scanType === "full") && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Subreddits</label>
              <input
                type="text"
                value={customSubreddits}
                onChange={(e) => setCustomSubreddits(e.target.value)}
                placeholder="e.g., SaaS, startups, Entrepreneur"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated. Default: {DEFAULT_SUBREDDITS.slice(0, 5).join(", ")}...
              </p>
            </div>
          )}

          {/* Competitors */}
          {(scanType === "reviews" || scanType === "full") && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Competitor Products</label>
                <input
                  type="text"
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  placeholder="e.g., Asana, Monday, ClickUp"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">Products to analyze reviews for.</p>
              </div>

              {/* Platforms */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Review Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                        platforms.includes(p.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm cursor-pointer hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Starting scan..." : "Start Scan"}
          </button>
        </form>
      </div>
    </div>
  );
}
