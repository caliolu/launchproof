import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, AuthError } from "@/lib/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const projectId = request.nextUrl.searchParams.get("projectId");
    let query = supabase
      .from("landing_pages")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (projectId) query = query.eq("project_id", projectId);

    const { data, error } = await query;
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
