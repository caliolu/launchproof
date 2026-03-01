export interface AdChannelConfig {
  id: "google_search" | "facebook" | "instagram" | "reddit" | "twitter";
  name: string;
  icon: string;
  description: string;
  minBudget: number;
  avgCpc: { min: number; max: number };
  bestFor: string[];
  contentFields: string[];
}

export const adChannels: AdChannelConfig[] = [
  {
    id: "google_search",
    name: "Google Search",
    icon: "search",
    description: "Capture high-intent searchers actively looking for solutions",
    minBudget: 10,
    avgCpc: { min: 0.5, max: 5 },
    bestFor: ["High intent", "B2B", "Service businesses"],
    contentFields: ["headlines", "descriptions", "sitelinks", "keywords"],
  },
  {
    id: "facebook",
    name: "Facebook Ads",
    icon: "facebook",
    description: "Reach broad audiences with visual ads and precise targeting",
    minBudget: 5,
    avgCpc: { min: 0.3, max: 3 },
    bestFor: ["B2C", "Community", "Visual products"],
    contentFields: ["primaryText", "headline", "description", "callToAction"],
  },
  {
    id: "instagram",
    name: "Instagram Ads",
    icon: "instagram",
    description: "Engage visual-first audiences with compelling creative",
    minBudget: 5,
    avgCpc: { min: 0.4, max: 4 },
    bestFor: ["Visual products", "Lifestyle", "Young demographics"],
    contentFields: ["caption", "hashtags", "callToAction"],
  },
  {
    id: "reddit",
    name: "Reddit Ads",
    icon: "message-circle",
    description: "Target niche communities with authentic, conversational ads",
    minBudget: 5,
    avgCpc: { min: 0.2, max: 2 },
    bestFor: ["Tech products", "Niche markets", "Developer tools"],
    contentFields: ["headline", "body", "subreddits", "callToAction"],
  },
  {
    id: "twitter",
    name: "X (Twitter) Ads",
    icon: "twitter",
    description: "Join real-time conversations and trending topics",
    minBudget: 5,
    avgCpc: { min: 0.3, max: 3 },
    bestFor: ["Tech", "News", "Thought leadership"],
    contentFields: ["tweetText", "hashtags", "callToAction"],
  },
];

export function getChannel(channelId: string): AdChannelConfig | undefined {
  return adChannels.find((c) => c.id === channelId);
}
