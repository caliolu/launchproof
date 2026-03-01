import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, AuthError, NotFoundError, ForbiddenError } from "@/lib/utils/errors";
import { getPlan } from "@/config/plans";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    // Check if user's plan allows publishing
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const plan = getPlan(profile?.plan || "free");
    if (!plan.limits.publishEnabled) {
      throw new ForbiddenError("Upgrade to Starter or Pro to publish your landing page");
    }

    const { data, error } = await supabase
      .from("landing_pages")
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) throw new NotFoundError("Landing page");

    // Also activate the project
    await supabase
      .from("projects")
      .update({ status: "active", test_started_at: new Date().toISOString() })
      .eq("id", data.project_id);

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

    const { data, error } = await supabase
      .from("landing_pages")
      .update({ is_published: false })
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
