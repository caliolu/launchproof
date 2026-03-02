import { NextRequest } from "next/server";
import { requirePro } from "@/lib/utils/require-pro";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, user, supabase, error } = await requirePro();
  if (!authorized || !user) return error!;

  const { id } = await params;

  const { data: job, error: fetchError } = await supabase
    .from("scan_jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !job) {
    return Response.json({ error: "Scan job not found" }, { status: 404 });
  }

  return Response.json({ job });
}
