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

interface RedditListingResponse {
  data: {
    children: Array<{
      data: {
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
        is_self: boolean;
      };
    }>;
    after: string | null;
  };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scrapeSubreddit(
  subreddit: string,
  searchQuery: string,
  limit: number = SCRAPER_CONFIG.reddit.maxPostsPerSubreddit
): Promise<RawRedditPost[]> {
  const posts: RawRedditPost[] = [];
  const config = SCRAPER_CONFIG.reddit;

  try {
    // Search within the subreddit for relevant posts
    const searchUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&restrict_sr=1&sort=relevance&t=year&limit=${Math.min(limit, 25)}`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": config.userAgent,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 429) {
        console.warn(`Reddit rate limited on r/${subreddit}, waiting...`);
        await delay(10000);
        return [];
      }
      console.warn(`Reddit API error for r/${subreddit}: ${res.status}`);
      return [];
    }

    const data: RedditListingResponse = await res.json();

    for (const child of data.data.children) {
      const post = child.data;
      // Only include text posts with meaningful content
      if (!post.is_self || (!post.selftext && post.title.length < 20)) continue;

      posts.push({
        id: post.id,
        subreddit: post.subreddit,
        title: post.title,
        selftext: post.selftext?.slice(0, 2000) || "",
        url: post.url,
        permalink: `https://www.reddit.com${post.permalink}`,
        score: post.score,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        author: post.author,
      });
    }
  } catch (error) {
    console.error(`Error scraping r/${subreddit}:`, error);
  }

  return posts;
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

    const posts = await scrapeSubreddit(sub, searchQuery);

    for (const post of posts) {
      if (!seenIds.has(post.id)) {
        seenIds.add(post.id);
        allPosts.push(post);
      }
    }

    // Stop if we hit the total limit
    if (allPosts.length >= config.maxPostsTotal) break;

    // Rate limit between subreddits
    if (i < subreddits.length - 1) {
      await delay(config.delayMs);
    }
  }

  // Sort by score (most popular first) and cap at limit
  return allPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, config.maxPostsTotal);
}
