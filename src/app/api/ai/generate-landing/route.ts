import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/ai/claude-client";
import { landingPageSystemPrompt } from "@/lib/ai/prompts/landing-system";
import { generateLandingContentTool } from "@/lib/ai/tools/landing-content";
import { landingPageContentSchema } from "@/lib/ai/schemas/landing-schema";
import { errorResponse, AuthError, ValidationError } from "@/lib/utils/errors";
import { generateUniqueSlug } from "@/lib/utils/slugify";
import type { Json } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError();

    const { projectId, template = "minimal" } = await request.json();
    if (!projectId) throw new ValidationError("Project ID required");

    // Get project with idea summary
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) throw new ValidationError("Project not found");
    if (!project.idea_summary) throw new ValidationError("Complete the AI Coach chat first");

    const idea = project.idea_summary as Record<string, unknown>;

    // Generate content via Claude
    const response = await generateContent(
      landingPageSystemPrompt,
      [
        {
          role: "user",
          content: `Generate landing page content for this startup idea:\n\n${JSON.stringify(idea, null, 2)}`,
        },
      ],
      [generateLandingContentTool],
      4096
    );

    // Extract tool use result
    const toolUseBlock = response.content.find((b) => b.type === "tool_use");
    if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
      throw new ValidationError("AI did not generate structured content");
    }

    // Validate with Zod
    const parsed = landingPageContentSchema.safeParse(toolUseBlock.input);
    if (!parsed.success) {
      throw new ValidationError(`Content validation failed: ${parsed.error.message}`);
    }

    const slug = generateUniqueSlug(idea.productName as string || project.name);

    // Save landing page
    const { data: landingPage, error } = await supabase
      .from("landing_pages")
      .insert({
        project_id: projectId,
        user_id: user.id,
        template,
        content: JSON.parse(JSON.stringify(parsed.data)) as Json,
        slug,
        meta_title: parsed.data.hero.headline,
        meta_description: parsed.data.hero.subheadline,
        cta_type: parsed.data.cta.type,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json(landingPage, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
