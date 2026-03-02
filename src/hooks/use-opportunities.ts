"use client";

import { useCallback, useEffect, useState } from "react";
import type { Opportunity } from "@/types/scanner";

interface UseOpportunitiesOptions {
  category?: string;
  minScore?: string;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface OpportunitiesState {
  opportunities: Opportunity[];
  total: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: string | null;
}

export function useOpportunities(options: UseOpportunitiesOptions = {}) {
  const [state, setState] = useState<OpportunitiesState>({
    opportunities: [],
    total: 0,
    totalPages: 0,
    page: options.page || 1,
    loading: true,
    error: null,
  });

  const fetchOpportunities = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    const params = new URLSearchParams();
    if (options.category) params.set("category", options.category);
    if (options.minScore) params.set("minScore", options.minScore);
    if (options.sort) params.set("sort", options.sort);
    if (options.search) params.set("search", options.search);
    params.set("page", String(options.page || 1));
    params.set("limit", String(options.limit || 20));

    try {
      const res = await fetch(`/api/scanner/opportunities?${params}`);
      if (!res.ok) {
        const data = await res.json();
        setState((s) => ({
          ...s,
          loading: false,
          error: data.error || "Failed to load opportunities",
        }));
        return;
      }

      const data = await res.json();
      setState({
        opportunities: data.opportunities,
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
        loading: false,
        error: null,
      });
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Network error" }));
    }
  }, [options.category, options.minScore, options.sort, options.search, options.page, options.limit]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const toggleFavorite = useCallback(
    async (opportunityId: string, currentFavorite: boolean) => {
      try {
        await fetch("/api/scanner/annotations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opportunityId,
            isFavorite: !currentFavorite,
          }),
        });

        setState((s) => ({
          ...s,
          opportunities: s.opportunities.map((opp) =>
            opp.id === opportunityId
              ? {
                  ...opp,
                  annotation: {
                    ...(opp.annotation || {
                      id: "",
                      user_id: "",
                      opportunity_id: opportunityId,
                      status: "new" as const,
                      notes: null,
                      created_at: "",
                      updated_at: "",
                    }),
                    is_favorite: !currentFavorite,
                  },
                }
              : opp
          ),
        }));
      } catch {
        // Revert on error
      }
    },
    []
  );

  return {
    ...state,
    refetch: fetchOpportunities,
    toggleFavorite,
  };
}
