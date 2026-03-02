import type { ReviewPlatform } from "@/types/scanner";

export const DEFAULT_SUBREDDITS = [
  "SaaS",
  "startups",
  "Entrepreneur",
  "smallbusiness",
  "indiehackers",
  "webdev",
  "marketing",
  "productivity",
  "selfhosted",
  "microsaas",
];

export const DEFAULT_SEARCH_PATTERNS = [
  "looking for a tool",
  "is there a SaaS",
  "alternative to",
  "frustrated with",
  "I wish there was",
  "anyone know a",
  "need a solution",
  "willing to pay",
  "would pay for",
  "pain point",
  "hate about",
  "switched from",
  "cancelled my subscription",
  "building a tool",
  "how do you handle",
];

export const REVIEW_PLATFORMS: { id: ReviewPlatform; name: string; baseUrl: string }[] = [
  { id: "g2", name: "G2", baseUrl: "https://www.g2.com" },
  { id: "capterra", name: "Capterra", baseUrl: "https://www.capterra.com" },
  { id: "producthunt", name: "Product Hunt", baseUrl: "https://www.producthunt.com" },
  { id: "trustpilot", name: "Trustpilot", baseUrl: "https://www.trustpilot.com" },
];

export const SCORING_WEIGHTS = {
  demand: 0.30,
  weakness: 0.20,
  frequency: 0.20,
  wtp: 0.15,
  feasibility: 0.15,
};

export const RATE_LIMITS = {
  scansPerHour: 1,
  scansPerMonth: 10,
};

export const SCRAPER_CONFIG = {
  reddit: {
    delayMs: 2000,
    maxPostsPerSubreddit: 25,
    maxPostsTotal: 100,
    userAgent: "LaunchProof/1.0 (Market Research Tool)",
  },
  reviews: {
    delayMs: 3000,
    maxReviewsPerProduct: 20,
    maxReviewsTotal: 80,
  },
};

export const AI_BATCH_CONFIG = {
  postsPerBatch: 5,
  reviewsPerBatch: 5,
  maxTokensPerAnalysis: 2048,
  maxTokensPerSynthesis: 4096,
  maxTokensPerBrief: 4096,
};

export const OPPORTUNITY_CATEGORIES = [
  "Project Management",
  "CRM & Sales",
  "Marketing & SEO",
  "Developer Tools",
  "Design & Creative",
  "Finance & Accounting",
  "HR & Recruiting",
  "Customer Support",
  "Communication",
  "Analytics & BI",
  "E-commerce",
  "Education & Learning",
  "Health & Wellness",
  "Productivity",
  "Security & Compliance",
  "AI & Automation",
  "Other",
];
