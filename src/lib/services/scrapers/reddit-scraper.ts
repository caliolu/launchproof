import { SCRAPER_CONFIG } from "@/config/scanner";

export interface RawRedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
  author: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// --- PullPush API (free, no auth, works from Vercel) ---

interface PullPushPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  full_link: string;
  score: number;
  num_comments: number;
  created_utc: number;
  author: string;
  is_self: boolean;
}

async function searchPullPush(
  subreddit: string,
  query: string,
  limit: number
): Promise<RawRedditPost[]> {
  try {
    const params = new URLSearchParams({
      subreddit,
      q: query,
      size: String(Math.min(limit, 100)),
      sort: "desc",
      sort_type: "score",
      is_self: "true",
    });

    const res = await fetch(`https://api.pullpush.io/reddit/search/submission/?${params}`, {
      headers: { "User-Agent": SCRAPER_CONFIG.reddit.userAgent },
    });

    if (!res.ok) {
      console.warn(`PullPush error for r/${subreddit}: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const posts: PullPushPost[] = json.data || [];

    return posts
      .filter((p) => p.selftext || p.title.length >= 20)
      .map((p) => ({
        id: p.id,
        subreddit: p.subreddit,
        title: p.title,
        selftext: (p.selftext || "").slice(0, 2000),
        url: p.url || p.full_link,
        permalink: p.permalink
          ? `https://www.reddit.com${p.permalink}`
          : p.full_link || `https://www.reddit.com/r/${p.subreddit}/comments/${p.id}`,
        score: p.score || 0,
        num_comments: p.num_comments || 0,
        created_utc: p.created_utc,
        author: p.author,
      }));
  } catch (error) {
    console.error(`PullPush error for r/${subreddit}:`, error);
    return [];
  }
}

// --- Reddit OAuth API (fallback if PullPush is down) ---

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  try {
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "User-Agent": SCRAPER_CONFIG.reddit.userAgent,
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) return null;

    const data = await res.json();
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    return cachedToken.token;
  } catch {
    return null;
  }
}

async function searchRedditOAuth(
  subreddit: string,
  query: string,
  limit: number
): Promise<RawRedditPost[]> {
  const token = await getOAuthToken();
  if (!token) return [];

  try {
    const url = `https://oauth.reddit.com/r/${subreddit}/search?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance&t=year&limit=${Math.min(limit, 25)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": SCRAPER_CONFIG.reddit.userAgent,
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data?.children || [])
      .filter((c: { data: { is_self: boolean; selftext: string; title: string } }) => {
        const p = c.data;
        return p.is_self && (p.selftext || p.title.length >= 20);
      })
      .map((c: { data: Record<string, unknown> }) => {
        const p = c.data as {
          id: string; subreddit: string; title: string; selftext: string;
          url: string; permalink: string; score: number; num_comments: number;
          created_utc: number; author: string;
        };
        return {
          id: p.id,
          subreddit: p.subreddit,
          title: p.title,
          selftext: (p.selftext || "").slice(0, 2000),
          url: p.url,
          permalink: `https://www.reddit.com${p.permalink}`,
          score: p.score,
          num_comments: p.num_comments,
          created_utc: p.created_utc,
          author: p.author,
        };
      });
  } catch {
    return [];
  }
}

// --- Main scraper (PullPush first, Reddit OAuth fallback) ---

async function scrapeSubreddit(
  subreddit: string,
  searchQuery: string,
  limit: number
): Promise<RawRedditPost[]> {
  // Try PullPush first (free, works from cloud)
  const posts = await searchPullPush(subreddit, searchQuery, limit);
  if (posts.length > 0) return posts;

  // Fallback to Reddit OAuth if available
  return searchRedditOAuth(subreddit, searchQuery, limit);
}

export async function scrapeReddit(
  subreddits: string[],
  keywords: string[],
  onProgress?: (message: string, current: number, total: number) => void
): Promise<RawRedditPost[]> {
  const allPosts: RawRedditPost[] = [];
  const seenIds = new Set<string>();
  const config = SCRAPER_CONFIG.reddit;
  const searchQuery = keywords.join(" OR ");

  for (let i = 0; i < subreddits.length; i++) {
    const sub = subreddits[i];
    onProgress?.(`Scanning r/${sub}...`, i + 1, subreddits.length);

    const posts = await scrapeSubreddit(sub, searchQuery, config.maxPostsPerSubreddit);

    for (const post of posts) {
      if (!seenIds.has(post.id)) {
        seenIds.add(post.id);
        allPosts.push(post);
      }
    }

    // Stop if we hit the total limit
    if (allPosts.length >= config.maxPostsTotal) break;

    // Rate limit between subreddits (PullPush: 15 req/min soft limit)
    if (i < subreddits.length - 1) {
      await delay(config.delayMs);
    }
  }

  onProgress?.(`Found ${allPosts.length} Reddit posts`, subreddits.length, subreddits.length);

  // Sort by score (most popular first) and cap at limit
  return allPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, config.maxPostsTotal);
}
