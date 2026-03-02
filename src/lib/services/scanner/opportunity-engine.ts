import { generateContent } from "@/lib/ai/claude-client";
import { opportunitySynthesisSystemPrompt } from "@/lib/ai/prompts/opportunity-synthesis-system";
import { productBriefSystemPrompt } from "@/lib/ai/prompts/product-brief-system";
import { synthesizeOpportunitiesTool } from "@/lib/ai/tools/opportunity-synthesis";
import { generateProductBriefTool } from "@/lib/ai/tools/product-brief";
import { opportunitySynthesisSchema, productBriefSchema } from "@/lib/ai/schemas/scanner-schemas";
import { SCORING_WEIGHTS, AI_BATCH_CONFIG } from "@/config/scanner";
import { generateUniqueSlug } from "@/lib/utils/slugify";
import type { SupabaseClient } from "@supabase/supabase-js";

function computeCompositeScore(opp: {
  demand_score: number;
  weakness_score: number;
  frequency_score: number;
  wtp_score: number;
  feasibility_score: number;
}): number {
  return Math.round(
    opp.demand_score * SCORING_WEIGHTS.demand +
    opp.weakness_score * SCORING_WEIGHTS.weakness +
    opp.frequency_score * SCORING_WEIGHTS.frequency +
    opp.wtp_score * SCORING_WEIGHTS.wtp +
    opp.feasibility_score * SCORING_WEIGHTS.feasibility
  );
}

export async function synthesizeOpportunities(
  scanJobId: string,
  adminClient: SupabaseClient,
  onProgress?: (message: string) => void
): Promise<number> {
  onProgress?.("Cross-referencing demand and weakness signals...");

  // Fetch all signals for this scan job
  const [{ data: redditSignals }, { data: reviewSignals }] = await Promise.all([
    adminClient
      .from("reddit_signals")
      .select("*")
      .eq("scan_job_id", scanJobId)
      .gte("opportunity_score", 4)
      .order("opportunity_score", { ascending: false }),
    adminClient
      .from("review_signals")
      .select("*")
      .eq("scan_job_id", scanJobId),
  ]);

  const reddit = redditSignals || [];
  const reviews = reviewSignals || [];

  if (reddit.length === 0 && reviews.length === 0) {
    return 0;
  }

  // Build context for synthesis
  const redditContext = reddit
    .slice(0, 30)
    .map(
      (s) =>
        `[Reddit Signal ${s.id}] r/${s.subreddit} (score: ${s.opportunity_score}/10)\nCategory: ${s.category}\nPain: ${s.pain_point}\nUrgency: ${s.urgency} | WTP: ${s.willingness_to_pay}\nFeatures wanted: ${(s.desired_features as string[] || []).join(", ")}`
    )
    .join("\n\n");

  const reviewContext = reviews
    .slice(0, 20)
    .map(
      (s) =>
        `[Review Signal ${s.id}] ${s.platform} - ${s.product_name} (${s.rating}/5)\nWeaknesses: ${(s.weakness_clusters as string[] || []).join(", ")}\nFeature gaps: ${(s.feature_gaps as string[] || []).join(", ")}\nChurn reasons: ${(s.churn_reasons as string[] || []).join(", ")}\nAffected: ${s.affected_segment}`
    )
    .join("\n\n");

  const prompt = `Here are demand signals from Reddit and weakness signals from product reviews. Cross-reference them to identify SaaS product opportunities.\n\n## Reddit Demand Signals (${reddit.length} total)\n\n${redditContext || "No Reddit signals available."}\n\n## Review Weakness Signals (${reviews.length} total)\n\n${reviewContext || "No review signals available."}`;

  onProgress?.("Synthesizing opportunities with AI...");

  const response = await generateContent(
    opportunitySynthesisSystemPrompt,
    [{ role: "user", content: prompt }],
    [synthesizeOpportunitiesTool],
    AI_BATCH_CONFIG.maxTokensPerSynthesis
  );

  const toolBlock = response.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    console.error("No tool use in synthesis response");
    return 0;
  }

  const parsed = opportunitySynthesisSchema.safeParse(toolBlock.input);
  if (!parsed.success) {
    console.error("Opportunity synthesis validation failed:", parsed.error.issues);
    return 0;
  }

  let savedCount = 0;

  for (const opp of parsed.data.opportunities) {
    const compositeScore = computeCompositeScore(opp);
    if (compositeScore < 40) continue;

    const slug = generateUniqueSlug(opp.title);

    // Count supporting signals
    const supportingReddit = opp.supporting_signal_ids.filter((id) =>
      reddit.some((s) => s.id === id)
    );
    const supportingReviews = opp.supporting_signal_ids.filter((id) =>
      reviews.some((s) => s.id === id)
    );

    const { data: savedOpp, error } = await adminClient
      .from("opportunities")
      .insert({
        scan_job_id: scanJobId,
        title: opp.title,
        slug,
        description: opp.description,
        category: opp.category,
        composite_score: compositeScore,
        demand_score: opp.demand_score,
        weakness_score: opp.weakness_score,
        frequency_score: opp.frequency_score,
        wtp_score: opp.wtp_score,
        feasibility_score: opp.feasibility_score,
        problem_statement: opp.problem_statement,
        target_audience: opp.target_audience,
        must_have_features: JSON.parse(JSON.stringify(opp.must_have_features)),
        suggested_pricing: opp.suggested_pricing,
        gtm_strategy: opp.gtm_strategy,
        competing_products: JSON.parse(JSON.stringify(opp.competing_products || [])),
        industries: JSON.parse(JSON.stringify(opp.industries || [])),
        tags: JSON.parse(JSON.stringify(opp.tags || [])),
        reddit_signal_count: supportingReddit.length || reddit.length,
        review_signal_count: supportingReviews.length || reviews.length,
      })
      .select("id")
      .single();

    if (error || !savedOpp) {
      console.error("Error saving opportunity:", error);
      continue;
    }

    // Link supporting signals
    const signalLinks = [
      ...supportingReddit.map((id) => ({
        opportunity_id: savedOpp.id,
        signal_type: "reddit" as const,
        signal_id: id,
        relevance_score: 0.8,
      })),
      ...supportingReviews.map((id) => ({
        opportunity_id: savedOpp.id,
        signal_type: "review" as const,
        signal_id: id,
        relevance_score: 0.8,
      })),
    ];

    if (signalLinks.length > 0) {
      await adminClient.from("opportunity_signals").insert(signalLinks);
    }

    savedCount++;
  }

  // Generate product briefs for top opportunities
  if (savedCount > 0) {
    onProgress?.("Generating product briefs for top opportunities...");
    await generateBriefs(scanJobId, adminClient);
  }

  return savedCount;
}

async function generateBriefs(
  scanJobId: string,
  adminClient: SupabaseClient
): Promise<void> {
  const { data: topOpps } = await adminClient
    .from("opportunities")
    .select("*")
    .eq("scan_job_id", scanJobId)
    .order("composite_score", { ascending: false })
    .limit(5);

  if (!topOpps?.length) return;

  for (const opp of topOpps) {
    try {
      // Get supporting signals
      const { data: signals } = await adminClient
        .from("opportunity_signals")
        .select("signal_type, signal_id")
        .eq("opportunity_id", opp.id);

      const redditIds = (signals || []).filter((s) => s.signal_type === "reddit").map((s) => s.signal_id);
      const reviewIds = (signals || []).filter((s) => s.signal_type === "review").map((s) => s.signal_id);

      let signalContext = "";
      if (redditIds.length > 0) {
        const { data: redditSignals } = await adminClient
          .from("reddit_signals")
          .select("pain_point, desired_features, urgency, willingness_to_pay, budget_range")
          .in("id", redditIds);
        signalContext += `\n\nReddit Signals:\n${(redditSignals || []).map((s) => `- Pain: ${s.pain_point} | Urgency: ${s.urgency} | WTP: ${s.willingness_to_pay}`).join("\n")}`;
      }

      const prompt = `Generate a product brief for this SaaS opportunity:\n\nTitle: ${opp.title}\nDescription: ${opp.description}\nCategory: ${opp.category}\nTarget Audience: ${opp.target_audience}\nProblem: ${opp.problem_statement}\nMust-have Features: ${(opp.must_have_features as string[] || []).join(", ")}\nSuggested Pricing: ${opp.suggested_pricing}\nGTM: ${opp.gtm_strategy}\nCompetitors: ${(opp.competing_products as Array<{ name: string; weakness: string }> || []).map((c) => `${c.name} (${c.weakness})`).join(", ")}${signalContext}`;

      const response = await generateContent(
        productBriefSystemPrompt,
        [{ role: "user", content: prompt }],
        [generateProductBriefTool],
        AI_BATCH_CONFIG.maxTokensPerBrief
      );

      const toolBlock = response.content.find((b) => b.type === "tool_use");
      if (!toolBlock || toolBlock.type !== "tool_use") continue;

      const parsed = productBriefSchema.safeParse(toolBlock.input);
      if (!parsed.success) continue;

      await adminClient
        .from("opportunities")
        .update({ product_brief: JSON.parse(JSON.stringify(parsed.data)) })
        .eq("id", opp.id);
    } catch (error) {
      console.error(`Error generating brief for opportunity ${opp.id}:`, error);
    }
  }
}
