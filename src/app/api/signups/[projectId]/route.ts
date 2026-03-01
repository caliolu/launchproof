import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, AuthError } from "@/lib/utils/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    // Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) throw new AuthError();

    const format = request.nextUrl.searchParams.get("format");

    const { data: signups, error } = await supabase
      .from("signups")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (format === "csv") {
      const headers = ["email", "name", "source", "medium", "campaign", "country", "created_at"];
      const csvRows = [
        headers.join(","),
        ...(signups || []).map((s) =>
          [s.email, s.name || "", s.source || "", s.medium || "", s.campaign || "", s.ip_country || "", s.created_at]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ];
      return new Response(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="signups-${projectId}.csv"`,
        },
      });
    }

    return Response.json(signups);
  } catch (error) {
    return errorResponse(error);
  }
}
