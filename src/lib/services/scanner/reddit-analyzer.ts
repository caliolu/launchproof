import { generateContent } from "@/lib/ai/claude-client";
import { redditAnalysisSystemPrompt } from "@/lib/ai/prompts/reddit-analysis-system";
import { analyzeRedditPostsTool } from "@/lib/ai/tools/reddit-analysis";
import { redditAnalysisSchema } from "@/lib/ai/schemas/scanner-schemas";
import { AI_BATCH_CONFIG } from "@/config/scanner";
import type { RawRedditPost } from "@/lib/services/scrapers/reddit-scraper";
import type { SupabaseClient } from "@supabase/supabase-js";

interface AnalyzedRedditPost {
  post_id: string;
  category: string;
  pain_point: string;
  desired_features: string[];
  urgency: "low" | "medium" | "high" | "critical";
  willingness_to_pay: "none" | "low" | "medium" | "high";
  budget_range?: string;
  opportunity_score: number;
}

export async function analyzeRedditPosts(
  posts: RawRedditPost[],
  scanJobId: string,
  adminClient: SupabaseClient,
  onProgress?: (message: string, current: number, total: number) => void
): Promise<number> {
  const batchSize = AI_BATCH_CONFIG.postsPerBatch;
  const batches: RawRedditPost[][] = [];

  for (let i = 0; i < posts.length; i += batchSize) {
    batches.push(posts.slice(i, i + batchSize));
  }

  let analyzedCount = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    onProgress?.(
      `Analyzing Reddit posts (batch ${batchIdx + 1}/${batches.length})...`,
      batchIdx + 1,
      batches.length
    );

    try {
      const postsText = batch
        .map(
          (p, i) =>
            `[Post ${i + 1}] (ID: ${p.id}) r/${p.subreddit}\nTitle: ${p.title}\nBody: ${p.selftext.slice(0, 500)}\nScore: ${p.score} | Comments: ${p.num_comments}`
        )
        .join("\n\n---\n\n");

      const response = await generateContent(
        redditAnalysisSystemPrompt,
        [{ role: "user", content: `Analyze these ${batch.length} Reddit posts for SaaS demand signals:\n\n${postsText}` }],
        [analyzeRedditPostsTool],
        AI_BATCH_CONFIG.maxTokensPerAnalysis
      );

      // Extract tool use result
      const toolBlock = response.content.find((b) => b.type === "tool_use");
      if (!toolBlock || toolBlock.type !== "tool_use") continue;

      const parsed = redditAnalysisSchema.safeParse(toolBlock.input);
      if (!parsed.success) {
        console.error("Reddit analysis validation failed:", parsed.error.issues);
        continue;
      }

      // Save analyzed signals to database
      for (const analysis of parsed.data.posts) {
        const originalPost = batch.find((p) => p.id === analysis.post_id);
        if (!originalPost) continue;

        // Skip low-score signals
        if (analysis.opportunity_score < 3) continue;

        const { error } = await adminClient
          .from("reddit_signals")
          .upsert(
            {
              scan_job_id: scanJobId,
              subreddit: originalPost.subreddit,
              post_id: originalPost.id,
              post_title: originalPost.title,
              post_body: originalPost.selftext.slice(0, 2000),
              post_url: originalPost.permalink,
              post_score: originalPost.score,
              comment_count: originalPost.num_comments,
              post_created_at: new Date(originalPost.created_utc * 1000).toISOString(),
              category: analysis.category,
              pain_point: analysis.pain_point,
              desired_features: JSON.parse(JSON.stringify(analysis.desired_features)),
              urgency: analysis.urgency,
              willingness_to_pay: analysis.willingness_to_pay,
              budget_range: analysis.budget_range || null,
              opportunity_score: analysis.opportunity_score,
              analysis_raw: JSON.parse(JSON.stringify(analysis)),
            },
            { onConflict: "post_id" }
          );

        if (!error) analyzedCount++;
      }
    } catch (error) {
      console.error(`Error analyzing Reddit batch ${batchIdx + 1}:`, error);
    }
  }

  return analyzedCount;
}
