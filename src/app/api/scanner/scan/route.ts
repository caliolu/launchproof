import { NextRequest } from "next/server";
import { requirePro } from "@/lib/utils/require-pro";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/utils/rate-limit";
import { runScan } from "@/lib/services/scanner/scan-orchestrator";
import type { ScanConfig, ScanType, ScanProgressEvent } from "@/types/scanner";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const { authorized, user, error } = await requirePro();
  if (!authorized || !user) return error!;

  // Rate limit: 1 scan/hour, 3/day
  const hourlyCheck = rateLimit(`scan:hourly:${user.id}`, 1, 3600000);
  if (!hourlyCheck.success) {
    return Response.json(
      { error: "You can only run 1 scan per hour" },
      { status: 429 }
    );
  }

  const dailyCheck = rateLimit(`scan:daily:${user.id}`, 3, 86400000);
  if (!dailyCheck.success) {
    return Response.json(
      { error: "You've reached your daily scan limit (3/day)" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const {
    scanType = "full",
    projectId,
    keywords,
    subreddits,
    platforms,
    competitors,
  } = body as {
    scanType?: ScanType;
    projectId?: string;
    keywords?: string[];
    subreddits?: string[];
    platforms?: string[];
    competitors?: string[];
  };

  const config: ScanConfig = {
    keywords,
    subreddits,
    platforms: platforms as ScanConfig["platforms"],
    competitors,
  };

  // Create scan job
  const adminClient = createAdminClient();
  const { data: scanJob, error: insertError } = await adminClient
    .from("scan_jobs")
    .insert({
      user_id: user.id,
      project_id: projectId || null,
      scan_type: scanType,
      config: JSON.parse(JSON.stringify(config)),
    })
    .select("id")
    .single();

  if (insertError || !scanJob) {
    return Response.json(
      { error: "Failed to create scan job" },
      { status: 500 }
    );
  }

  // SSE stream for real-time progress
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ScanProgressEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      // Send initial job ID
      send({
        type: "status",
        status: "pending",
        message: "Scan job created",
        data: { jobId: scanJob.id },
      });

      await runScan(scanJob.id, scanType, config, {
        onProgress: (event) => {
          try {
            send(event);
          } catch {
            // Client disconnected
          }
        },
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
