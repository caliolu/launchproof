import { describe, it, expect } from "vitest";
import { calculateValidationScore } from "@/lib/validation/score-calculator";

describe("Validation score edge cases", () => {
  it("handles exactly threshold values for conversion tiers", () => {
    const tests = [
      { rate: 10, min: 90 },
      { rate: 5, min: 70 },
      { rate: 2, min: 50 },
      { rate: 1, min: 30 },
      { rate: 0.5, min: 15 },
    ];

    for (const { rate, min } of tests) {
      const result = calculateValidationScore({
        totalPageViews: 100,
        totalUniqueVisitors: 50,
        totalSignups: 5,
        conversionRate: rate,
      });
      expect(result.conversion).toBeGreaterThanOrEqual(min);
    }
  });

  it("handles exactly threshold values for traffic tiers", () => {
    const tests = [
      { visitors: 500, expected: 90 },
      { visitors: 200, expected: 70 },
      { visitors: 100, expected: 50 },
      { visitors: 50, expected: 35 },
      { visitors: 20, expected: 20 },
      { visitors: 1, expected: 10 },
      { visitors: 0, expected: 0 },
    ];

    for (const { visitors, expected } of tests) {
      const result = calculateValidationScore({
        totalPageViews: visitors * 2,
        totalUniqueVisitors: visitors,
        totalSignups: 0,
        conversionRate: 0,
      });
      expect(result.traffic).toBe(expected);
    }
  });

  it("engagement defaults to 50 without optional data", () => {
    const result = calculateValidationScore({
      totalPageViews: 100,
      totalUniqueVisitors: 50,
      totalSignups: 5,
      conversionRate: 5,
    });
    expect(result.engagement).toBe(50);
  });

  it("engagement adjusts with avgTimeOnPage", () => {
    const short = calculateValidationScore({
      totalPageViews: 100,
      totalUniqueVisitors: 50,
      totalSignups: 5,
      conversionRate: 5,
      avgTimeOnPage: 10,
    });
    const long = calculateValidationScore({
      totalPageViews: 100,
      totalUniqueVisitors: 50,
      totalSignups: 5,
      conversionRate: 5,
      avgTimeOnPage: 180,
    });
    expect(long.engagement).toBeGreaterThan(short.engagement);
  });

  it("quality score combines signups and conversion rate", () => {
    const highQuality = calculateValidationScore({
      totalPageViews: 1000,
      totalUniqueVisitors: 500,
      totalSignups: 50,
      conversionRate: 5,
    });
    const lowQuality = calculateValidationScore({
      totalPageViews: 1000,
      totalUniqueVisitors: 500,
      totalSignups: 2,
      conversionRate: 0.5,
    });
    expect(highQuality.quality).toBeGreaterThan(lowQuality.quality);
  });
});
