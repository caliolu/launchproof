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

/**
 * Scrape reviews for a competitor product from a specific platform.
 * Falls back to mock data if scraping fails (blocked, rate limited, etc.)
 */
async function scrapeG2(productName: string): Promise<RawReview[]> {
  // G2 has anti-scraping measures. In production, use ScrapingBee/Apify API.
  // For now, return empty with a warning so the pipeline can still process.
  console.warn(`G2 scraping for "${productName}" requires API key. Using empty results.`);
  return [];
}

async function scrapeCapterra(productName: string): Promise<RawReview[]> {
  console.warn(`Capterra scraping for "${productName}" requires API key. Using empty results.`);
  return [];
}

async function scrapeProductHunt(productName: string): Promise<RawReview[]> {
  // Product Hunt GraphQL API is public for reading
  try {
    const searchUrl = `https://www.producthunt.com/frontend/graphql`;

    const res = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `query { posts(topic: "${productName}", first: 10) { edges { node { id name tagline votesCount reviewsRating reviews(first: 10) { edges { node { id body rating user { name } createdAt } } } } } } }`,
      }),
    });

    if (!res.ok) {
      console.warn(`Product Hunt API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const reviews: RawReview[] = [];

    const posts = data?.data?.posts?.edges || [];
    for (const post of posts) {
      const product = post.node;
      const productReviews = product.reviews?.edges || [];
      for (const rev of productReviews) {
        const review = rev.node;
        if (review.rating && review.rating <= 3) {
          reviews.push({
            platform: "producthunt",
            product_name: product.name,
            reviewer_name: review.user?.name || null,
            rating: review.rating,
            review_title: null,
            review_body: review.body,
            review_url: null,
            review_date: review.createdAt,
          });
        }
      }
    }

    return reviews;
  } catch (error) {
    console.warn("Product Hunt scraping failed:", error);
    return [];
  }
}

async function scrapeTrustpilot(productName: string): Promise<RawReview[]> {
  console.warn(`Trustpilot scraping for "${productName}" requires API key. Using empty results.`);
  return [];
}

const platformScrapers: Record<ReviewPlatform, (product: string) => Promise<RawReview[]>> = {
  g2: scrapeG2,
  capterra: scrapeCapterra,
  producthunt: scrapeProductHunt,
  trustpilot: scrapeTrustpilot,
};

export async function scrapeReviews(
  competitors: string[],
  platforms: ReviewPlatform[],
  onProgress?: (message: string, current: number, total: number) => void
): Promise<RawReview[]> {
  const allReviews: RawReview[] = [];
  const config = SCRAPER_CONFIG.reviews;
  const totalSteps = competitors.length * platforms.length;
  let currentStep = 0;

  for (const competitor of competitors) {
    for (const platform of platforms) {
      currentStep++;
      onProgress?.(
        `Scanning ${platform} for "${competitor}"...`,
        currentStep,
        totalSteps
      );

      try {
        const scraper = platformScrapers[platform];
        const reviews = await scraper(competitor);
        allReviews.push(...reviews.slice(0, config.maxReviewsPerProduct));
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
