import { describe, it, expect } from "vitest";
import { calculateValidationScore } from "@/lib/validation/score-calculator";

describe("calculateValidationScore", () => {
  it("returns zero for no data", () => {
    const result = calculateValidationScore({
      totalPageViews: 0,
      totalUniqueVisitors: 0,
      totalSignups: 0,
      conversionRate: 0,
    });
    expect(result.total).toBe(0);
    expect(result.conversion).toBe(0);
    expect(result.traffic).toBe(0);
    expect(result.engagement).toBe(0);
    expect(result.quality).toBe(0);
  });

  it("scores high for excellent metrics", () => {
    const result = calculateValidationScore({
      totalPageViews: 1000,
      totalUniqueVisitors: 600,
      totalSignups: 120,
      conversionRate: 12,
      avgTimeOnPage: 180,
      bounceRate: 20,
    });
    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.conversion).toBeGreaterThanOrEqual(90);
    expect(result.traffic).toBeGreaterThanOrEqual(90);
    expect(result.quality).toBeGreaterThanOrEqual(90);
  });

  it("scores moderately for average metrics", () => {
    const result = calculateValidationScore({
      totalPageViews: 200,
      totalUniqueVisitors: 100,
      totalSignups: 10,
      conversionRate: 3,
      avgTimeOnPage: 60,
    });
    expect(result.total).toBeGreaterThan(30);
    expect(result.total).toBeLessThan(80);
  });

  it("scores low for poor metrics", () => {
    const result = calculateValidationScore({
      totalPageViews: 15,
      totalUniqueVisitors: 10,
      totalSignups: 0,
      conversionRate: 0,
    });
    expect(result.total).toBeLessThan(30);
  });

  it("total score is always between 0 and 100", () => {
    const extremeHigh = calculateValidationScore({
      totalPageViews: 100000,
      totalUniqueVisitors: 50000,
      totalSignups: 10000,
      conversionRate: 50,
      avgTimeOnPage: 500,
      bounceRate: 5,
    });
    expect(extremeHigh.total).toBeLessThanOrEqual(100);
    expect(extremeHigh.total).toBeGreaterThanOrEqual(0);
  });

  it("weights are applied correctly (conversion 40%, traffic 25%, engagement 20%, quality 15%)", () => {
    const result = calculateValidationScore({
      totalPageViews: 200,
      totalUniqueVisitors: 100,
      totalSignups: 10,
      conversionRate: 5,
      avgTimeOnPage: 60,
    });
    // conversion=70, traffic=50, engagement=70, quality=50
    // total = 70*0.4 + 50*0.25 + 70*0.2 + 50*0.15 = 28+12.5+14+7.5 = 62
    expect(result.total).toBe(62);
  });

  it("gives signup bonus for high signup counts", () => {
    const withFewSignups = calculateValidationScore({
      totalPageViews: 100,
      totalUniqueVisitors: 50,
      totalSignups: 5,
      conversionRate: 10,
    });
    const withManySignups = calculateValidationScore({
      totalPageViews: 100,
      totalUniqueVisitors: 50,
      totalSignups: 100,
      conversionRate: 10,
    });
    expect(withManySignups.conversion).toBeGreaterThan(withFewSignups.conversion);
  });

  it("penalizes high bounce rate", () => {
    const lowBounce = calculateValidationScore({
      totalPageViews: 200,
      totalUniqueVisitors: 100,
      totalSignups: 10,
      conversionRate: 5,
      avgTimeOnPage: 60,
      bounceRate: 25,
    });
    const highBounce = calculateValidationScore({
      totalPageViews: 200,
      totalUniqueVisitors: 100,
      totalSignups: 10,
      conversionRate: 5,
      avgTimeOnPage: 60,
      bounceRate: 90,
    });
    expect(lowBounce.engagement).toBeGreaterThan(highBounce.engagement);
  });
});
