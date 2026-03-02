"use client";

import { useCallback, useRef, useState } from "react";
import type { ScanType, ScanProgressEvent, ReviewPlatform } from "@/types/scanner";

interface ScanJobState {
  isScanning: boolean;
  events: ScanProgressEvent[];
  jobId: string | null;
  error: string | null;
}

export function useScanJob() {
  const [state, setState] = useState<ScanJobState>({
    isScanning: false,
    events: [],
    jobId: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const startScan = useCallback(
    async (config: {
      scanType: ScanType;
      projectId?: string;
      keywords?: string[];
      subreddits?: string[];
      platforms?: ReviewPlatform[];
      competitors?: string[];
    }) => {
      setState({ isScanning: true, events: [], jobId: null, error: null });
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/scanner/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          setState((s) => ({
            ...s,
            isScanning: false,
            error: data.error || "Scan failed",
          }));
          return;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          setState((s) => ({ ...s, isScanning: false, error: "No response body" }));
          return;
        }

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: ScanProgressEvent = JSON.parse(line.slice(6));

              setState((s) => ({
                ...s,
                events: [...s.events, event],
                jobId: (event.data as { jobId?: string })?.jobId || s.jobId,
              }));

              if (event.type === "done" || event.type === "error") {
                setState((s) => ({
                  ...s,
                  isScanning: false,
                  error: event.type === "error" ? event.message || "Unknown error" : null,
                }));
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setState((s) => ({
            ...s,
            isScanning: false,
            error: "Scan connection lost",
          }));
        }
      } finally {
        abortRef.current = null;
      }
    },
    []
  );

  const cancelScan = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, isScanning: false }));
  }, []);

  return {
    ...state,
    startScan,
    cancelScan,
  };
}
