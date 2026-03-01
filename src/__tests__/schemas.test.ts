import { describe, it, expect } from "vitest";
import { ideaSummarySchema } from "@/lib/ai/schemas/idea-schema";
import { landingPageContentSchema } from "@/lib/ai/schemas/landing-schema";
import { adContentSchema } from "@/lib/ai/schemas/ad-schema";

describe("ideaSummarySchema", () => {
  const validIdea = {
    productName: "LaunchProof",
    oneLiner: "Validate your startup idea in 24 hours",
    problemStatement: "Entrepreneurs waste months building things nobody wants",
    targetAudience: "Solo founders and indie hackers",
    valueProposition: "AI-powered validation with real market data in one day",
    keyFeatures: ["AI Coach", "Landing Page Generator", "Ad Strategist"],
    industry: "SaaS",
    monetizationModel: "Freemium subscription",
    toneAndStyle: "Professional yet approachable",
    ctaType: "waitlist" as const,
    ctaText: "Join the waitlist",
  };

  it("accepts valid input", () => {
    const result = ideaSummarySchema.safeParse(validIdea);
    expect(result.success).toBe(true);
  });

  it("requires all fields", () => {
    const { productName: _, ...incomplete } = validIdea;
    const result = ideaSummarySchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("validates productName length", () => {
    const result = ideaSummarySchema.safeParse({ ...validIdea, productName: "" });
    expect(result.success).toBe(false);
  });

  it("validates ctaType enum", () => {
    const result = ideaSummarySchema.safeParse({ ...validIdea, ctaType: "invalid" });
    expect(result.success).toBe(false);
  });

  it("validates keyFeatures min length", () => {
    const result = ideaSummarySchema.safeParse({ ...validIdea, keyFeatures: ["one"] });
    expect(result.success).toBe(false);
  });

  it("validates keyFeatures max length", () => {
    const result = ideaSummarySchema.safeParse({
      ...validIdea,
      keyFeatures: Array(9).fill("feature"),
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid ctaType values", () => {
    for (const ctaType of ["waitlist", "preorder", "demo", "custom"]) {
      const result = ideaSummarySchema.safeParse({ ...validIdea, ctaType });
      expect(result.success).toBe(true);
    }
  });
});

describe("landingPageContentSchema", () => {
  const validLanding = {
    hero: {
      headline: "Test Your Startup Idea",
      subheadline: "Before you write a single line of code",
      ctaText: "Get Started",
      imagePrompt: "Abstract illustration of startup validation dashboard",
    },
    problem: {
      title: "The Problem",
      description: "Building without validation is risky",
      painPoints: ["Wasted time", "Wasted money"],
    },
    solution: {
      title: "The Solution",
      description: "AI-powered validation",
      features: [
        { title: "Feature 1", description: "Description 1" },
        { title: "Feature 2", description: "Description 2" },
      ],
    },
    cta: {
      headline: "Ready to start?",
      description: "Join today and start validating",
      buttonText: "Sign up",
      type: "waitlist",
    },
  };

  it("accepts valid input", () => {
    const result = landingPageContentSchema.safeParse(validLanding);
    expect(result.success).toBe(true);
  });

  it("rejects missing hero", () => {
    const { hero: _, ...noHero } = validLanding;
    const result = landingPageContentSchema.safeParse(noHero);
    expect(result.success).toBe(false);
  });

  it("accepts optional socialProof and faq", () => {
    const withOptional = {
      ...validLanding,
      socialProof: {
        title: "Testimonials",
        testimonials: [{ quote: "This tool is absolutely amazing for validation!", author: "John", role: "CEO at Acme" }],
      },
      faq: [{ question: "How does it work?", answer: "You describe your idea and we validate it with real data" }],
    };
    const result = landingPageContentSchema.safeParse(withOptional);
    expect(result.success).toBe(true);
  });
});

describe("adContentSchema", () => {
  it("accepts valid ad content", () => {
    const result = adContentSchema.safeParse({
      channel: "google_search",
      recommended: true,
      recommendationReason: "High intent traffic",
      content: { headline: "Test Ad" },
    });
    expect(result.success).toBe(true);
  });

  it("validates channel enum", () => {
    const result = adContentSchema.safeParse({
      channel: "tiktok",
      recommended: false,
      recommendationReason: "Not supported",
      content: {},
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid channels", () => {
    for (const channel of ["google_search", "facebook", "instagram", "reddit", "twitter"]) {
      const result = adContentSchema.safeParse({
        channel,
        recommended: false,
        recommendationReason: "Test",
        content: {},
      });
      expect(result.success).toBe(true);
    }
  });
});
