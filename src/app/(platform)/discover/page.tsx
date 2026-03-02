"use client";

import { useState } from "react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { useScanJob } from "@/hooks/use-scan-job";
import { useSubscription } from "@/hooks/use-subscription";
import { OpportunityCard } from "@/components/scanner/opportunity-card";
import { OpportunityFilters } from "@/components/scanner/opportunity-filters";
import { ScanDialog } from "@/components/scanner/scan-dialog";
import { ScanProgress } from "@/components/scanner/scan-progress";
import { ProGate } from "@/components/scanner/pro-gate";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Radar, Search } from "lucide-react";

export default function DiscoverPage() {
  const { plan, loading: planLoading } = useSubscription();
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [category, setCategory] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sort, setSort] = useState("composite_score");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const {
    opportunities,
    total,
    totalPages,
    loading: oppsLoading,
    error: oppsError,
    toggleFavorite,
    refetch,
  } = useOpportunities({ category, minScore, sort, search, page });

  const { isScanning, events, startScan } = useScanJob();

  if (planLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (plan !== "pro") {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Discover Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered market intelligence to find your next SaaS idea
          </p>
        </div>
        <ProGate feature="Market Research" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Discover Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered market intelligence from Reddit and review platforms
          </p>
        </div>
        <button
          onClick={() => setShowScanDialog(true)}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-purple-500 text-primary-foreground font-medium text-sm cursor-pointer hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <Radar className="h-4 w-4" />
          {isScanning ? "Scanning..." : "New Scan"}
        </button>
      </div>

      {/* Scan Progress */}
      {(isScanning || events.length > 0) && (
        <div className="mb-6">
          <ScanProgress events={events} isRunning={isScanning} />
          {!isScanning && events.length > 0 && (
            <button
              onClick={refetch}
              className="mt-2 text-sm text-primary hover:underline cursor-pointer"
            >
              Refresh opportunities
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <OpportunityFilters
          category={category}
          onCategoryChange={(v) => { setCategory(v); setPage(1); }}
          minScore={minScore}
          onMinScoreChange={(v) => { setMinScore(v); setPage(1); }}
          sort={sort}
          onSortChange={setSort}
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
        />
      </div>

      {/* Results */}
      {oppsLoading ? (
        <LoadingState message="Loading opportunities..." />
      ) : oppsError ? (
        <p className="text-sm text-destructive">{oppsError}</p>
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No opportunities yet"
          description="Run your first scan to discover SaaS opportunities from Reddit and review platforms."
          action={
            <button
              onClick={() => setShowScanDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-purple-500 text-primary-foreground font-medium text-sm cursor-pointer hover:brightness-110 transition-all"
            >
              <Radar className="h-4 w-4" />
              Run First Scan
            </button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {total} {total === 1 ? "opportunity" : "opportunities"} found
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-50 cursor-pointer hover:bg-accent"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-50 cursor-pointer hover:bg-accent"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Scan Dialog */}
      <ScanDialog
        open={showScanDialog}
        onClose={() => setShowScanDialog(false)}
        onStartScan={(config) => {
          setShowScanDialog(false);
          startScan(config);
        }}
        loading={isScanning}
      />
    </div>
  );
}
