import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, AuthError, ValidationError } from "@/lib/utils/errors";
import { generateUniqueSlug } from "@/lib/utils/slugify";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const body = await request.json();
    if (!body.name) throw new ValidationError("Project name is required");

    const slug = generateUniqueSlug(body.name);
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: body.name, slug })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
