import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProjectMetrics } from "@/lib/validation/metrics";
import { calculateValidationScore } from "@/lib/validation/score-calculator";
import { errorResponse, AuthError } from "@/lib/utils/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    // Verify ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) throw new AuthError();

    const period = request.nextUrl.searchParams.get("period") || "30d";
    const days = period === "7d" ? 7 : period === "14d" ? 14 : period === "all" ? 365 : 30;

    const metrics = await getProjectMetrics(projectId, days);
    const score = calculateValidationScore({
      totalPageViews: metrics.totalPageViews,
      totalUniqueVisitors: metrics.totalUniqueVisitors,
      totalSignups: metrics.totalSignups,
      conversionRate: metrics.conversionRate,
    });

    // Update project score
    await supabase
      .from("projects")
      .update({ validation_score: score.total })
      .eq("id", projectId);

    return Response.json({ metrics, score });
  } catch (error) {
    return errorResponse(error);
  }
}
