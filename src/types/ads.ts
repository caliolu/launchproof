export interface GoogleSearchAd {
  headlines: string[];
  descriptions: string[];
  sitelinks: { title: string; description: string; url: string }[];
  keywords: string[];
  negativeKeywords: string[];
}

export interface FacebookAd {
  primaryText: string;
  headline: string;
  description: string;
  callToAction: string;
  imagePrompt: string;
  imageUrl?: string;
  targetingNotes: string;
}

export interface InstagramAd {
  caption: string;
  hashtags: string[];
  callToAction: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface RedditAd {
  headline: string;
  body: string;
  subreddits: string[];
  callToAction: string;
}

export interface TwitterAd {
  tweetText: string;
  hashtags: string[];
  callToAction: string;
}

export type AdContent =
  | { channel: "google_search"; data: GoogleSearchAd }
  | { channel: "facebook"; data: FacebookAd }
  | { channel: "instagram"; data: InstagramAd }
  | { channel: "reddit"; data: RedditAd }
  | { channel: "twitter"; data: TwitterAd };

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: "low" | "medium" | "high";
  trend: number[];
}
