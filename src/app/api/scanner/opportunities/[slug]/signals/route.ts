import { NextRequest } from "next/server";
import { requirePro } from "@/lib/utils/require-pro";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { authorized, user, supabase, error } = await requirePro();
  if (!authorized || !user) return error!;

  const { slug } = await params;

  // Get opportunity
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!opportunity) {
    return Response.json({ error: "Opportunity not found" }, { status: 404 });
  }

  // Get linked signals
  const { data: links } = await supabase
    .from("opportunity_signals")
    .select("signal_type, signal_id, relevance_score")
    .eq("opportunity_id", opportunity.id);

  if (!links || links.length === 0) {
    return Response.json({ reddit_signals: [], review_signals: [] });
  }

  const redditIds = links.filter((l) => l.signal_type === "reddit").map((l) => l.signal_id);
  const reviewIds = links.filter((l) => l.signal_type === "review").map((l) => l.signal_id);

  const [redditResult, reviewResult] = await Promise.all([
    redditIds.length > 0
      ? supabase.from("reddit_signals").select("*").in("id", redditIds)
      : { data: [] },
    reviewIds.length > 0
      ? supabase.from("review_signals").select("*").in("id", reviewIds)
      : { data: [] },
  ]);

  return Response.json({
    reddit_signals: redditResult.data || [],
    review_signals: reviewResult.data || [],
  });
}
