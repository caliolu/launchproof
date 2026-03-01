import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/ai/claude-client";
import { adsSystemPrompt } from "@/lib/ai/prompts/ads-system";
import { generateMultiChannelAdsTool } from "@/lib/ai/tools/ad-content";
import { errorResponse, AuthError, ValidationError } from "@/lib/utils/errors";
import type { Json } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const { projectId } = await request.json();
    if (!projectId) throw new ValidationError("Project ID required");

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) throw new ValidationError("Project not found");
    if (!project.idea_summary) throw new ValidationError("Complete the AI Coach first");

    const response = await generateContent(
      adsSystemPrompt,
      [
        {
          role: "user",
          content: `Generate ad content for all 5 channels for this startup:\n\n${JSON.stringify(project.idea_summary, null, 2)}\n\nTarget audience: ${project.target_audience || "Not specified"}\nValue proposition: ${project.value_proposition || "Not specified"}`,
        },
      ],
      [generateMultiChannelAdsTool],
      4096
    );

    const toolUseBlock = response.content.find((b) => b.type === "tool_use");
    if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
      throw new ValidationError("AI did not generate structured ad content");
    }

    const input = toolUseBlock.input as { ads: Array<{ channel: string; recommended: boolean; recommendationReason: string; content: Record<string, unknown> }> };

    // Save each channel's ad campaign
    const results = [];
    for (const ad of input.ads) {
      const { data, error } = await supabase
        .from("ad_campaigns")
        .upsert(
          {
            project_id: projectId,
            user_id: user.id,
            channel: ad.channel as "google_search" | "facebook" | "instagram" | "reddit" | "twitter",
            recommended: ad.recommended,
            recommendation_reason: ad.recommendationReason,
            content: JSON.parse(JSON.stringify(ad.content)) as Json,
          },
          { onConflict: "project_id,channel" }
        )
        .select()
        .single();

      if (!error && data) results.push(data);
    }

    return Response.json(results, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
