import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, AuthError, NotFoundError } from "@/lib/utils/errors";
import type { Json } from "@/types/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const { data } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!data) throw new NotFoundError("Landing page");
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const body = await request.json();
    // Whitelist allowed fields
    const allowedFields = ["template", "content", "color_scheme", "meta_title", "meta_description", "cta_type"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    // Ensure JSONB fields are properly serialized
    if (updates.content) updates.content = JSON.parse(JSON.stringify(updates.content)) as Json;
    if (updates.color_scheme) updates.color_scheme = JSON.parse(JSON.stringify(updates.color_scheme)) as Json;

    const { data, error } = await supabase
      .from("landing_pages")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) throw new NotFoundError("Landing page");
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    await supabase.from("landing_pages").delete().eq("id", id).eq("user_id", user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
