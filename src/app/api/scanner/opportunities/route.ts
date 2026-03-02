import { NextRequest } from "next/server";
import { requirePro } from "@/lib/utils/require-pro";

export async function GET(request: NextRequest) {
  const { authorized, user, supabase, error } = await requirePro();
  if (!authorized || !user) return error!;

  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const minScore = searchParams.get("minScore");
  const sort = searchParams.get("sort") || "composite_score";
  const order = searchParams.get("order") || "desc";
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("opportunities")
    .select("*", { count: "exact" });

  if (category) {
    query = query.eq("category", category);
  }

  if (minScore) {
    query = query.gte("composite_score", parseFloat(minScore));
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const validSortFields = ["composite_score", "created_at", "demand_score", "weakness_score", "wtp_score"];
  const sortField = validSortFields.includes(sort) ? sort : "composite_score";

  query = query
    .order(sortField, { ascending: order === "asc" })
    .range(offset, offset + limit - 1);

  const { data: opportunities, count, error: fetchError } = await query;

  if (fetchError) {
    return Response.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }

  // Fetch user annotations for these opportunities
  const oppIds = (opportunities || []).map((o) => o.id);
  let annotations: Record<string, unknown> = {};

  if (oppIds.length > 0) {
    const { data: annots } = await supabase
      .from("opportunity_annotations")
      .select("*")
      .eq("user_id", user.id)
      .in("opportunity_id", oppIds);

    if (annots) {
      annotations = Object.fromEntries(annots.map((a) => [a.opportunity_id, a]));
    }
  }

  // Merge annotations into opportunities
  const enriched = (opportunities || []).map((opp) => ({
    ...opp,
    annotation: annotations[opp.id] || null,
  }));

  return Response.json({
    opportunities: enriched,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
