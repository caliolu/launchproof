import { generateContent } from "@/lib/ai/claude-client";
import { reviewAnalysisSystemPrompt } from "@/lib/ai/prompts/review-analysis-system";
import { analyzeReviewsTool } from "@/lib/ai/tools/review-analysis";
import { reviewAnalysisSchema } from "@/lib/ai/schemas/scanner-schemas";
import { AI_BATCH_CONFIG } from "@/config/scanner";
import type { RawReview } from "@/lib/services/scrapers/review-scraper";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function analyzeReviews(
  reviews: RawReview[],
  scanJobId: string,
  adminClient: SupabaseClient,
  onProgress?: (message: string, current: number, total: number) => void
): Promise<number> {
  if (reviews.length === 0) return 0;

  const batchSize = AI_BATCH_CONFIG.reviewsPerBatch;
  const batches: RawReview[][] = [];

  for (let i = 0; i < reviews.length; i += batchSize) {
    batches.push(reviews.slice(i, i + batchSize));
  }

  let analyzedCount = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    onProgress?.(
      `Analyzing reviews (batch ${batchIdx + 1}/${batches.length})...`,
      batchIdx + 1,
      batches.length
    );

    try {
      const reviewsText = batch
        .map(
          (r, i) =>
            `[Review ${i}] Platform: ${r.platform} | Product: ${r.product_name} | Rating: ${r.rating || "N/A"}/5\nTitle: ${r.review_title || "N/A"}\nBody: ${r.review_body.slice(0, 500)}`
        )
        .join("\n\n---\n\n");

      const response = await generateContent(
        reviewAnalysisSystemPrompt,
        [{ role: "user", content: `Analyze these ${batch.length} product reviews for competitive intelligence:\n\n${reviewsText}` }],
        [analyzeReviewsTool],
        AI_BATCH_CONFIG.maxTokensPerAnalysis
      );

      const toolBlock = response.content.find((b) => b.type === "tool_use");
      if (!toolBlock || toolBlock.type !== "tool_use") continue;

      const parsed = reviewAnalysisSchema.safeParse(toolBlock.input);
      if (!parsed.success) {
        console.error("Review analysis validation failed:", parsed.error.issues);
        continue;
      }

      for (const analysis of parsed.data.reviews) {
        const originalReview = batch[analysis.review_index];
        if (!originalReview) continue;

        const { error } = await adminClient.from("review_signals").insert({
          scan_job_id: scanJobId,
          platform: originalReview.platform,
          product_name: originalReview.product_name,
          reviewer_name: originalReview.reviewer_name,
          rating: originalReview.rating,
          review_title: originalReview.review_title,
          review_body: originalReview.review_body.slice(0, 2000),
          review_url: originalReview.review_url,
          review_date: originalReview.review_date,
          weakness_clusters: JSON.parse(JSON.stringify(analysis.weakness_clusters)),
          feature_gaps: JSON.parse(JSON.stringify(analysis.feature_gaps)),
          churn_reasons: JSON.parse(JSON.stringify(analysis.churn_reasons || [])),
          affected_segment: analysis.affected_segment,
          analysis_raw: JSON.parse(JSON.stringify(analysis)),
        });

        if (!error) analyzedCount++;
      }
    } catch (error) {
      console.error(`Error analyzing review batch ${batchIdx + 1}:`, error);
    }
  }

  return analyzedCount;
}
