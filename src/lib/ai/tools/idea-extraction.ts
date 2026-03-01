import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const extractIdeaDetailsTool: Tool = {
  name: "extract_idea_details",
  description:
    "Extract structured details about the user's startup idea from the conversation. Call this tool when you have gathered enough information across all 5 phases (idea core, target audience, value proposition, monetization, tone & CTA). This structured output will be used to generate landing pages and ad content.",
  input_schema: {
    type: "object" as const,
    properties: {
      productName: {
        type: "string",
        description: "The name of the product or service",
      },
      oneLiner: {
        type: "string",
        description: "A one-sentence pitch for the product (max 200 chars)",
      },
      problemStatement: {
        type: "string",
        description: "The core problem this product solves",
      },
      targetAudience: {
        type: "string",
        description: "Who this product is for — demographics, psychographics, job title, etc.",
      },
      valueProposition: {
        type: "string",
        description: "Why this product is better than alternatives — the unique value",
      },
      keyFeatures: {
        type: "array",
        items: { type: "string" },
        description: "2-8 key features or benefits of the product",
      },
      industry: {
        type: "string",
        description: "The industry or vertical (e.g., 'SaaS', 'E-commerce', 'Health & Fitness')",
      },
      monetizationModel: {
        type: "string",
        description: "How the product makes money (e.g., 'Freemium SaaS', 'One-time purchase')",
      },
      toneAndStyle: {
        type: "string",
        description: "The brand tone (e.g., 'Professional and trustworthy', 'Fun and casual')",
      },
      ctaType: {
        type: "string",
        enum: ["waitlist", "preorder", "demo", "custom"],
        description: "The type of call-to-action for the landing page",
      },
      ctaText: {
        type: "string",
        description: "The call-to-action button text (e.g., 'Join the Waitlist', 'Get Early Access')",
      },
    },
    required: [
      "productName",
      "oneLiner",
      "problemStatement",
      "targetAudience",
      "valueProposition",
      "keyFeatures",
      "industry",
      "monetizationModel",
      "toneAndStyle",
      "ctaType",
      "ctaText",
    ],
  },
};
