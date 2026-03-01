interface ScoreInput {
  totalPageViews: number;
  totalUniqueVisitors: number;
  totalSignups: number;
  conversionRate: number;
  avgTimeOnPage?: number;
  bounceRate?: number;
}

interface ScoreBreakdown {
  total: number;
  conversion: number;
  traffic: number;
  engagement: number;
  quality: number;
}

// Weights: Conversion 40%, Traffic 25%, Engagement 20%, Quality 15%
export function calculateValidationScore(input: ScoreInput): ScoreBreakdown {
  const conversion = calculateConversionScore(input.conversionRate, input.totalSignups);
  const traffic = calculateTrafficScore(input.totalPageViews, input.totalUniqueVisitors);
  const engagement = calculateEngagementScore(input.avgTimeOnPage, input.bounceRate);
  const quality = calculateQualityScore(input.totalSignups, input.conversionRate);

  const total = Math.round(
    conversion * 0.4 + traffic * 0.25 + engagement * 0.2 + quality * 0.15
  );

  return {
    total: Math.min(100, Math.max(0, total)),
    conversion: Math.round(conversion),
    traffic: Math.round(traffic),
    engagement: Math.round(engagement),
    quality: Math.round(quality),
  };
}

function calculateConversionScore(conversionRate: number, totalSignups: number): number {
  // > 10% conversion is excellent, > 5% is good, > 2% is average
  let score = 0;

  if (conversionRate >= 10) score = 90;
  else if (conversionRate >= 5) score = 70;
  else if (conversionRate >= 2) score = 50;
  else if (conversionRate >= 1) score = 30;
  else if (conversionRate > 0) score = 15;

  // Bonus for absolute signups
  if (totalSignups >= 100) score = Math.min(100, score + 10);
  else if (totalSignups >= 50) score = Math.min(100, score + 5);

  return score;
}

function calculateTrafficScore(pageViews: number, uniqueVisitors: number): number {
  // Volume matters — need enough data to be statistically meaningful
  if (uniqueVisitors >= 500) return 90;
  if (uniqueVisitors >= 200) return 70;
  if (uniqueVisitors >= 100) return 50;
  if (uniqueVisitors >= 50) return 35;
  if (uniqueVisitors >= 20) return 20;
  if (uniqueVisitors > 0) return 10;
  return 0;
}

function calculateEngagementScore(avgTimeOnPage?: number, bounceRate?: number): number {
  let score = 0; // No data = no score

  if (avgTimeOnPage !== undefined) {
    if (avgTimeOnPage >= 120) score = 90;
    else if (avgTimeOnPage >= 60) score = 70;
    else if (avgTimeOnPage >= 30) score = 50;
    else score = 30;
  }

  if (bounceRate !== undefined) {
    if (bounceRate <= 30) score = Math.min(100, score + 15);
    else if (bounceRate <= 50) score = Math.min(100, score + 5);
    else if (bounceRate >= 80) score = Math.max(0, score - 15);
  }

  return score;
}

function calculateQualityScore(totalSignups: number, conversionRate: number): number {
  // Quality signal: are people giving real emails?
  // Uses signup count + conversion as proxy
  if (totalSignups >= 50 && conversionRate >= 5) return 90;
  if (totalSignups >= 20 && conversionRate >= 3) return 70;
  if (totalSignups >= 10) return 50;
  if (totalSignups >= 5) return 30;
  if (totalSignups > 0) return 15;
  return 0;
}
