import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ProCheckResult {
  authorized: boolean;
  user: { id: string; email: string } | null;
  supabase: SupabaseClient;
  error?: Response;
}

export async function requirePro(): Promise<ProCheckResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false,
      user: null,
      supabase,
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan !== "pro") {
    return {
      authorized: false,
      user: { id: user.id, email: user.email || "" },
      supabase,
      error: Response.json(
        { error: "Market Research is available on the Pro plan", code: "PLAN_REQUIRED" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: { id: user.id, email: user.email || "" },
    supabase,
  };
}
