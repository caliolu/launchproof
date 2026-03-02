import { createAdminClient } from "@/lib/supabase/admin";
import { generateContent } from "@/lib/ai/claude-client";
import { marketFitSystemPrompt } from "@/lib/ai/prompts/market-fit-system";
import { analyzeMarketFitTool } from "@/lib/ai/tools/market-fit-analysis";
import { marketFitSchema } from "@/lib/ai/schemas/scanner-schemas";
import { AI_BATCH_CONFIG } from "@/config/scanner";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function analyzeMarketFit(
  projectId: string,
  userId: string
): Promise<{ count: number; error?: string }> {
  const adminClient = createAdminClient();

  // Get project details
  const { data: project, error: projectError } = await adminClient
    .from("projects")
    .select("id, name, idea_summary, target_audience, problem_statement, value_proposition, industry")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) {
    return { count: 0, error: "Project not found" };
  }

  if (!project.idea_summary) {
    return { count: 0, error: "Complete the AI Coach conversation first to generate your idea summary" };
  }

  // Get existing opportunities (most recent, highest scored)
  const { data: opportunities } = await adminClient
    .from("opportunities")
    .select("id, title, description, category, composite_score, problem_statement, target_audience, must_have_features, industries, tags")
    .order("composite_score", { ascending: false })
    .limit(20);

  if (!opportunities || opportunities.length === 0) {
    return { count: 0, error: "No opportunities available. Run a scan first from the Discover page." };
  }

  // Build project context
  const ideaSummary = project.idea_summary as Record<string, unknown>;
  const projectContext = `
Project: ${project.name}
One-liner: ${ideaSummary.oneLiner || "N/A"}
Problem: ${project.problem_statement || ideaSummary.problemStatement || "N/A"}
Target Audience: ${project.target_audience || ideaSummary.targetAudience || "N/A"}
Value Proposition: ${project.value_proposition || ideaSummary.valueProposition || "N/A"}
Industry: ${project.industry || ideaSummary.industry || "N/A"}
Key Features: ${(ideaSummary.keyFeatures as string[] || []).join(", ") || "N/A"}
Monetization: ${ideaSummary.monetizationModel || "N/A"}`.trim();

  const oppsContext = opportunities
    .map(
      (o) =>
        `[ID: ${o.id}] ${o.title} (Score: ${o.composite_score}/100)\nCategory: ${o.category}\nDescription: ${o.description}\nTarget: ${o.target_audience || "N/A"}\nProblem: ${o.problem_statement || "N/A"}\nFeatures: ${(o.must_have_features as string[] || []).join(", ")}`
    )
    .join("\n\n---\n\n");

  const prompt = `Analyze how relevant these market opportunities are to this user's project idea.\n\n## User's Project\n${projectContext}\n\n## Available Opportunities (${opportunities.length} total)\n\n${oppsContext}`;

  const response = await generateContent(
    marketFitSystemPrompt,
    [{ role: "user", content: prompt }],
    [analyzeMarketFitTool],
    AI_BATCH_CONFIG.maxTokensPerSynthesis
  );

  const toolBlock = response.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    return { count: 0, error: "AI analysis failed to produce results" };
  }

  const parsed = marketFitSchema.safeParse(toolBlock.input);
  if (!parsed.success) {
    console.error("Market fit validation failed:", parsed.error.issues);
    return { count: 0, error: "AI output validation failed" };
  }

  // Delete previous results for this project
  await adminClient
    .from("project_market_research")
    .delete()
    .eq("project_id", projectId);

  // Save new results
  let savedCount = 0;
  for (const result of parsed.data.results) {
    // Verify opportunity exists
    const oppExists = opportunities.find((o) => o.id === result.opportunity_id);
    if (!oppExists) continue;

    const { error } = await adminClient.from("project_market_research").insert({
      project_id: projectId,
      opportunity_id: result.opportunity_id,
      relevance_score: result.relevance_score,
      relevance_explanation: result.relevance_explanation,
      market_fit_analysis: JSON.parse(JSON.stringify({
        fit_level: result.fit_level,
        overlap_areas: result.overlap_areas,
        differentiation_opportunities: result.differentiation_opportunities,
        market_size_indicator: result.market_size_indicator,
      })),
      competitive_advantages: JSON.parse(JSON.stringify(result.competitive_advantages)),
      risks: JSON.parse(JSON.stringify(result.risks)),
      recommendation: result.recommendation,
    });

    if (!error) savedCount++;
  }

  return { count: savedCount };
}
