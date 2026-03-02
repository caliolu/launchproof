"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketResearchResult } from "@/types/scanner";

interface MarketResearchState {
  results: MarketResearchResult[];
  loading: boolean;
  analyzing: boolean;
  error: string | null;
}

export function useMarketResearch(projectId: string) {
  const [state, setState] = useState<MarketResearchState>({
    results: [],
    loading: true,
    analyzing: false,
    error: null,
  });

  const fetchResults = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await fetch(`/api/scanner/market-research/${projectId}`);
      if (!res.ok) {
        const data = await res.json();
        setState((s) => ({
          ...s,
          loading: false,
          error: data.error || "Failed to load market research",
        }));
        return;
      }

      const data = await res.json();
      setState({
        results: data.results || [],
        loading: false,
        analyzing: false,
        error: null,
      });
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Network error" }));
    }
  }, [projectId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const triggerAnalysis = useCallback(async () => {
    setState((s) => ({ ...s, analyzing: true, error: null }));

    try {
      const res = await fetch("/api/scanner/market-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setState((s) => ({
          ...s,
          analyzing: false,
          error: data.error || "Analysis failed",
        }));
        return;
      }

      // Refetch results after analysis
      await fetchResults();
    } catch {
      setState((s) => ({ ...s, analyzing: false, error: "Network error" }));
    }
  }, [projectId, fetchResults]);

  return {
    ...state,
    refetch: fetchResults,
    triggerAnalysis,
  };
}
