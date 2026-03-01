interface KeywordResult {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: "low" | "medium" | "high";
}

export async function getKeywordData(keywords: string[]): Promise<KeywordResult[]> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    // Return mock data if DataForSEO not configured
    return keywords.map((keyword) => ({
      keyword,
      searchVolume: Math.floor(Math.random() * 10000) + 100,
      cpc: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
      competition: (["low", "medium", "high"] as const)[Math.floor(Math.random() * 3)],
    }));
  }

  const auth = Buffer.from(`${login}:${password}`).toString("base64");

  try {
    const response = await fetch(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            keywords,
            language_code: "en",
            location_code: 2840, // US
          },
        ]),
      }
    );

    const data = await response.json();
    const results = data?.tasks?.[0]?.result || [];

    return results.map((r: Record<string, unknown>) => ({
      keyword: r.keyword as string,
      searchVolume: (r.search_volume as number) || 0,
      cpc: (r.cpc as number) || 0,
      competition: mapCompetition(r.competition as number),
    }));
  } catch {
    return keywords.map((keyword) => ({
      keyword,
      searchVolume: 0,
      cpc: 0,
      competition: "low" as const,
    }));
  }
}

function mapCompetition(value: number): "low" | "medium" | "high" {
  if (value >= 0.66) return "high";
  if (value >= 0.33) return "medium";
  return "low";
}
