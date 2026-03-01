import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, AuthError } from "@/lib/utils/errors";
import { getPlan } from "@/config/plans";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    // Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) throw new AuthError();

    // Get user's plan to apply signup visibility limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const plan = getPlan(profile?.plan || "free");
    const limit = plan.limits.maxSignups;

    const format = request.nextUrl.searchParams.get("format");

    // Get total count first (to show "X more hidden" info)
    const { count: totalCount } = await supabase
      .from("signups")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    // Fetch signups with plan limit applied
    let query = supabase
      .from("signups")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (limit < Infinity) {
      query = query.limit(limit);
    }

    const { data: signups, error } = await query;
    if (error) throw error;

    const hiddenCount = Math.max(0, (totalCount || 0) - (limit < Infinity ? limit : (totalCount || 0)));

    if (format === "csv") {
      const headers = ["email", "name", "source", "medium", "campaign", "country", "created_at"];
      const csvRows = [
        headers.join(","),
        ...(signups || []).map((s) =>
          [s.email, s.name || "", s.source || "", s.medium || "", s.campaign || "", s.ip_country || "", s.created_at]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ];
      return new Response(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="signups-${projectId}.csv"`,
        },
      });
    }

    return Response.json({ signups, totalCount: totalCount || 0, hiddenCount });
  } catch (error) {
    return errorResponse(error);
  }
}
