import { createAdminClient } from "@/lib/supabase/admin";
import { scrapeReddit } from "@/lib/services/scrapers/reddit-scraper";
import { scrapeReviews } from "@/lib/services/scrapers/review-scraper";
import { analyzeRedditPosts } from "@/lib/services/scanner/reddit-analyzer";
import { analyzeReviews } from "@/lib/services/scanner/review-analyzer";
import { synthesizeOpportunities } from "@/lib/services/scanner/opportunity-engine";
import { DEFAULT_SUBREDDITS, DEFAULT_SEARCH_PATTERNS } from "@/config/scanner";
import type { ScanConfig, ScanType, ScanProgressEvent, ScanResultsSummary } from "@/types/scanner";

interface OrchestratorCallbacks {
  onProgress: (event: ScanProgressEvent) => void;
}

export async function runScan(
  scanJobId: string,
  scanType: ScanType,
  config: ScanConfig,
  callbacks: OrchestratorCallbacks
): Promise<void> {
  const adminClient = createAdminClient();
  const { onProgress } = callbacks;
  const errors: string[] = [];

  const summary: ScanResultsSummary = {
    reddit_posts_found: 0,
    reddit_posts_analyzed: 0,
    reviews_found: 0,
    reviews_analyzed: 0,
    opportunities_generated: 0,
  };

  try {
    // Mark as running
    await adminClient
      .from("scan_jobs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", scanJobId);

    onProgress({ type: "status", status: "running", message: "Scan started" });

    // Step 1: Scrape Reddit (if applicable)
    if (scanType === "reddit" || scanType === "full") {
      onProgress({ type: "progress", step: "reddit_scrape", message: "Scraping Reddit..." });

      const subreddits = config.subreddits?.length ? config.subreddits : DEFAULT_SUBREDDITS;
      const keywords = config.keywords?.length ? config.keywords : DEFAULT_SEARCH_PATTERNS.slice(0, 5);

      try {
        const posts = await scrapeReddit(subreddits, keywords, (msg, current, total) => {
          onProgress({ type: "progress", step: "reddit_scrape", message: msg, current, total });
        });

        summary.reddit_posts_found = posts.length;
        onProgress({ type: "progress", step: "reddit_scrape", message: `Found ${posts.length} Reddit posts` });

        if (posts.length > 0) {
          onProgress({ type: "progress", step: "reddit_analyze", message: "Analyzing Reddit posts with AI..." });

          summary.reddit_posts_analyzed = await analyzeRedditPosts(
            posts,
            scanJobId,
            adminClient,
            (msg, current, total) => {
              onProgress({ type: "progress", step: "reddit_analyze", message: msg, current, total });
            }
          );
        }
      } catch (error) {
        const msg = `Reddit scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`;
        errors.push(msg);
        console.error(msg);
      }
    }

    // Step 2: Scrape Reviews (if applicable)
    if (scanType === "reviews" || scanType === "full") {
      onProgress({ type: "progress", step: "review_scrape", message: "Scraping reviews..." });

      const platforms = config.platforms || ["g2", "capterra", "producthunt", "trustpilot"];
      const competitors = config.competitors || [];

      if (competitors.length > 0) {
        try {
          const reviews = await scrapeReviews(competitors, platforms, (msg, current, total) => {
            onProgress({ type: "progress", step: "review_scrape", message: msg, current, total });
          });

          summary.reviews_found = reviews.length;

          if (reviews.length > 0) {
            onProgress({ type: "progress", step: "review_analyze", message: "Analyzing reviews with AI..." });

            summary.reviews_analyzed = await analyzeReviews(
              reviews,
              scanJobId,
              adminClient,
              (msg, current, total) => {
                onProgress({ type: "progress", step: "review_analyze", message: msg, current, total });
              }
            );
          }
        } catch (error) {
          const msg = `Review scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`;
          errors.push(msg);
          console.error(msg);
        }
      }
    }

    // Step 3: Cross-reference and generate opportunities
    if (summary.reddit_posts_analyzed > 0 || summary.reviews_analyzed > 0) {
      onProgress({ type: "progress", step: "synthesis", message: "Synthesizing opportunities..." });

      summary.opportunities_generated = await synthesizeOpportunities(
        scanJobId,
        adminClient,
        (msg) => {
          onProgress({ type: "progress", step: "synthesis", message: msg });
        }
      );
    }

    // Determine final status
    const hasResults = summary.opportunities_generated > 0;
    const hasErrors = errors.length > 0;
    const finalStatus = hasErrors && !hasResults ? "failed" : hasErrors ? "partial" : "completed";

    summary.errors = errors.length > 0 ? errors : undefined;

    await adminClient
      .from("scan_jobs")
      .update({
        status: finalStatus,
        results_summary: JSON.parse(JSON.stringify(summary)),
        error_message: errors.length > 0 ? errors.join("; ") : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanJobId);

    onProgress({
      type: "done",
      status: finalStatus,
      message: `Scan complete: ${summary.opportunities_generated} opportunities found`,
      data: summary,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Scan orchestrator error:", error);

    await adminClient
      .from("scan_jobs")
      .update({
        status: "failed",
        error_message: errorMsg,
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanJobId);

    onProgress({ type: "error", message: errorMsg });
  }
}
