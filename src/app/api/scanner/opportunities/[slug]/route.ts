import { NextRequest } from "next/server";
import { requirePro } from "@/lib/utils/require-pro";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { authorized, user, supabase, error } = await requirePro();
  if (!authorized || !user) return error!;

  const { slug } = await params;

  const { data: opportunity, error: fetchError } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (fetchError || !opportunity) {
    return Response.json({ error: "Opportunity not found" }, { status: 404 });
  }

  // Get user annotation
  const { data: annotation } = await supabase
    .from("opportunity_annotations")
    .select("*")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunity.id)
    .single();

  return Response.json({
    opportunity: { ...opportunity, annotation: annotation || null },
  });
}
