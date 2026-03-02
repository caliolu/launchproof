import { NextRequest } from "next/server";
import { requirePro } from "@/lib/utils/require-pro";

export async function GET(request: NextRequest) {
  const { authorized, user, supabase, error } = await requirePro();
  if (!authorized || !user) return error!;

  const favoriteOnly = request.nextUrl.searchParams.get("favorites") === "true";

  let query = supabase
    .from("opportunity_annotations")
    .select("*, opportunities(*)")
    .eq("user_id", user.id);

  if (favoriteOnly) {
    query = query.eq("is_favorite", true);
  }

  const { data: annotations, error: fetchError } = await query.order("updated_at", { ascending: false });

  if (fetchError) {
    return Response.json({ error: "Failed to fetch annotations" }, { status: 500 });
  }

  return Response.json({ annotations: annotations || [] });
}

export async function POST(request: NextRequest) {
  const { authorized, user, supabase, error } = await requirePro();
  if (!authorized || !user) return error!;

  const body = await request.json();
  const { opportunityId, isFavorite, status, notes } = body as {
    opportunityId: string;
    isFavorite?: boolean;
    status?: string;
    notes?: string;
  };

  if (!opportunityId) {
    return Response.json({ error: "opportunityId is required" }, { status: 400 });
  }

  // Upsert annotation
  const updateData: Record<string, unknown> = {};
  if (isFavorite !== undefined) updateData.is_favorite = isFavorite;
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const { data: existing } = await supabase
    .from("opportunity_annotations")
    .select("id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .single();

  if (existing) {
    const { data, error: updateError } = await supabase
      .from("opportunity_annotations")
      .update(updateData)
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) {
      return Response.json({ error: "Failed to update annotation" }, { status: 500 });
    }
    return Response.json({ annotation: data });
  }

  const { data, error: insertError } = await supabase
    .from("opportunity_annotations")
    .insert({
      user_id: user.id,
      opportunity_id: opportunityId,
      is_favorite: isFavorite ?? false,
      status: status ?? "new",
      notes: notes ?? null,
    })
    .select()
    .single();

  if (insertError) {
    return Response.json({ error: "Failed to create annotation" }, { status: 500 });
  }

  return Response.json({ annotation: data }, { status: 201 });
}
