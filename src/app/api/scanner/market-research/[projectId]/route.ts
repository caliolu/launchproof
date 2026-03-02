import { NextRequest } from "next/server";
import { requirePro } from "@/lib/utils/require-pro";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { authorized, user, supabase, error } = await requirePro();
  if (!authorized || !user) return error!;

  const { projectId } = await params;

  // Verify user owns this project
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  // Get market research results with opportunity details
  const { data: results, error: fetchError } = await supabase
    .from("project_market_research")
    .select("*, opportunities(*)")
    .eq("project_id", projectId)
    .order("relevance_score", { ascending: false });

  if (fetchError) {
    return Response.json({ error: "Failed to fetch market research" }, { status: 500 });
  }

  return Response.json({ results: results || [] });
}
