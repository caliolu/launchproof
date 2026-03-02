import { SCRAPER_CONFIG } from "@/config/scanner";
import type { ReviewPlatform } from "@/types/scanner";

export interface RawReview {
  platform: ReviewPlatform;
  product_name: string;
  reviewer_name: string | null;
  rating: number | null;
  review_title: string | null;
  review_body: string;
  review_url: string | null;
  review_date: string | null;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// --- Apify Actor Definitions ---

const APIFY_ACTORS: Record<ReviewPlatform, { actorId: string; buildInput: (product: string) => Record<string, unknown> }> = {
  g2: {
    actorId: "focused_vanguard/g2-reviews-scraper",
    buildInput: (product) => ({
      productUrl: `https://www.g2.com/products/${slugify(product)}/reviews`,
      maxReviews: 20,
      minRating: 1,
      maxRating: 3,
    }),
  },
  capterra: {
    actorId: "imadjourney/capterra-reviews-scraper",
    buildInput: (product) => ({
      urls: [`https://www.capterra.com/p/search/?q=${encodeURIComponent(product)}`],
      maxReviews: 20,
    }),
  },
  trustpilot: {
    actorId: "yin/trustpilot-scraper",
    buildInput: (product) => ({
      urls: [`https://www.trustpilot.com/review/${slugify(product)}.com`],
      maxReviews: 20,
    }),
  },
  producthunt: {
    actorId: "omkar-cloud/producthunt-scraper",
    buildInput: (product) => ({
      queries: [product],
      maxResults: 20,
    }),
  },
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// --- Apify API ---

async function runApifyActor(
  actorId: string,
  input: Record<string, unknown>,
  timeoutSecs: number = 120
): Promise<Record<string, unknown>[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.warn("APIFY_API_TOKEN not set — skipping review scraping");
    return [];
  }

  try {
    // Run actor synchronously and get dataset items
    const actorPath = actorId.replace("/", "~");
    const url = `https://api.apify.com/v2/acts/${actorPath}/run-sync-get-dataset-items?token=${token}&timeout=${timeoutSecs}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`Apify actor ${actorId} failed: ${res.status} ${text.slice(0, 200)}`);
      return [];
    }

    const items = await res.json();
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error(`Apify actor ${actorId} error:`, error);
    return [];
  }
}

// --- Platform-specific parsers ---

function parseG2Results(items: Record<string, unknown>[], productName: string): RawReview[] {
  return items
    .filter((item) => item.reviewBody || item.body || item.text)
    .map((item) => ({
      platform: "g2" as ReviewPlatform,
      product_name: (item.productName as string) || productName,
      reviewer_name: (item.reviewerName as string) || (item.author as string) || null,
      rating: typeof item.rating === "number" ? item.rating : typeof item.starRating === "number" ? item.starRating : null,
      review_title: (item.reviewTitle as string) || (item.title as string) || null,
      review_body: ((item.reviewBody as string) || (item.body as string) || (item.text as string) || "").slice(0, 3000),
      review_url: (item.url as string) || (item.reviewUrl as string) || null,
      review_date: (item.date as string) || (item.publishedAt as string) || null,
    }));
}

function parseCapterraResults(items: Record<string, unknown>[], productName: string): RawReview[] {
  return items
    .filter((item) => item.review || item.body || item.text || item.cons)
    .map((item) => ({
      platform: "capterra" as ReviewPlatform,
      product_name: (item.productName as string) || productName,
      reviewer_name: (item.reviewerName as string) || (item.author as string) || null,
      rating: typeof item.overallRating === "number" ? item.overallRating : typeof item.rating === "number" ? item.rating : null,
      review_title: (item.title as string) || (item.headline as string) || null,
      review_body: ((item.cons as string) || (item.review as string) || (item.body as string) || (item.text as string) || "").slice(0, 3000),
      review_url: (item.url as string) || null,
      review_date: (item.date as string) || (item.publishedAt as string) || null,
    }));
}

function parseTrustpilotResults(items: Record<string, unknown>[], productName: string): RawReview[] {
  return items
    .filter((item) => item.text || item.body || item.reviewBody)
    .map((item) => ({
      platform: "trustpilot" as ReviewPlatform,
      product_name: (item.companyName as string) || productName,
      reviewer_name: (item.reviewerName as string) || (item.name as string) || (item.author as string) || null,
      rating: typeof item.rating === "number" ? item.rating : typeof item.stars === "number" ? item.stars : null,
      review_title: (item.title as string) || null,
      review_body: ((item.text as string) || (item.body as string) || (item.reviewBody as string) || "").slice(0, 3000),
      review_url: (item.url as string) || null,
      review_date: (item.date as string) || (item.publishedAt as string) || (item.dateOfExperience as string) || null,
    }));
}

function parseProductHuntResults(items: Record<string, unknown>[], productName: string): RawReview[] {
  return items
    .filter((item) => item.review || item.body || item.text || item.tagline)
    .map((item) => ({
      platform: "producthunt" as ReviewPlatform,
      product_name: (item.name as string) || productName,
      reviewer_name: (item.reviewerName as string) || (item.makerName as string) || null,
      rating: typeof item.rating === "number" ? item.rating : typeof item.votesCount === "number" ? Math.min(5, Math.ceil(item.votesCount / 100)) : null,
      review_title: (item.tagline as string) || (item.title as string) || null,
      review_body: ((item.review as string) || (item.body as string) || (item.text as string) || (item.description as string) || "").slice(0, 3000),
      review_url: (item.url as string) || null,
      review_date: (item.date as string) || (item.createdAt as string) || null,
    }));
}

const parsers: Record<ReviewPlatform, (items: Record<string, unknown>[], product: string) => RawReview[]> = {
  g2: parseG2Results,
  capterra: parseCapterraResults,
  trustpilot: parseTrustpilotResults,
  producthunt: parseProductHuntResults,
};

// --- Main export ---

export async function scrapeReviews(
  competitors: string[],
  platforms: ReviewPlatform[],
  onProgress?: (message: string, current: number, total: number) => void
): Promise<RawReview[]> {
  if (!process.env.APIFY_API_TOKEN) {
    onProgress?.("Skipping reviews — APIFY_API_TOKEN not configured", 0, 0);
    return [];
  }

  const allReviews: RawReview[] = [];
  const config = SCRAPER_CONFIG.reviews;
  const totalSteps = competitors.length * platforms.length;
  let currentStep = 0;

  for (const competitor of competitors) {
    for (const platform of platforms) {
      currentStep++;
      onProgress?.(
        `Scraping ${platform} for "${competitor}"...`,
        currentStep,
        totalSteps
      );

      try {
        const actorDef = APIFY_ACTORS[platform];
        const input = actorDef.buildInput(competitor);
        const items = await runApifyActor(actorDef.actorId, input);

        const parser = parsers[platform];
        const reviews = parser(items, competitor);

        // Only keep negative/critical reviews (rating <= 3 or unknown)
        const filtered = reviews.filter((r) => r.rating === null || r.rating <= 3);
        allReviews.push(...filtered.slice(0, config.maxReviewsPerProduct));

        onProgress?.(
          `Found ${filtered.length} reviews from ${platform} for "${competitor}"`,
          currentStep,
          totalSteps
        );
      } catch (error) {
        console.warn(`Review scraping failed for ${competitor} on ${platform}:`, error);
      }

      // Rate limit between requests
      if (currentStep < totalSteps) {
        await delay(config.delayMs);
      }

      // Stop if we hit total limit
      if (allReviews.length >= config.maxReviewsTotal) {
        return allReviews.slice(0, config.maxReviewsTotal);
      }
    }
  }

  return allReviews;
}
