import { requirePro } from "@/lib/utils/require-pro";

export async function GET() {
  const { authorized, user, supabase, error } = await requirePro();
  if (!authorized || !user) return error!;

  const { data: jobs, error: fetchError } = await supabase
    .from("scan_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (fetchError) {
    return Response.json({ error: "Failed to fetch scan jobs" }, { status: 500 });
  }

  return Response.json({ jobs: jobs || [] });
}
