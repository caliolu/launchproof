import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const generateProductBriefTool: Tool = {
  name: "generate_product_brief",
  description:
    "Generate a comprehensive product brief for a SaaS opportunity, including personas, MVP features, pricing, GTM strategy, and competitive analysis.",
  input_schema: {
    type: "object" as const,
    properties: {
      executive_summary: {
        type: "string",
        description: "2-3 sentence summary of the product opportunity",
      },
      problem_deep_dive: {
        type: "string",
        description: "Detailed analysis of the core problem with examples from signals",
      },
      target_personas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Archetype name (e.g., 'The Overloaded PM')" },
            description: { type: "string", description: "Role, company size, daily reality" },
            pain_points: { type: "array", items: { type: "string" } },
            willingness_to_pay: { type: "string", description: "How much and why" },
          },
          required: ["name", "description", "pain_points", "willingness_to_pay"],
        },
        description: "2-4 target user personas",
      },
      mvp_features: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            priority: { type: "string", enum: ["must-have", "nice-to-have"] },
          },
          required: ["name", "description", "priority"],
        },
        description: "Minimum viable feature set",
      },
      pricing_strategy: {
        type: "string",
        description: "Specific tier recommendations based on WTP signals",
      },
      go_to_market: {
        type: "string",
        description: "First 90 days GTM plan with specific channels and tactics",
      },
      competitive_landscape: {
        type: "string",
        description: "Who exists, what they charge, and why users leave them",
      },
      risks_and_mitigations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            risk: { type: "string" },
            mitigation: { type: "string" },
          },
          required: ["risk", "mitigation"],
        },
        description: "Key risks and how to prepare for them",
      },
      success_metrics: {
        type: "array",
        items: { type: "string" },
        description: "What numbers to track in the first 6 months",
      },
    },
    required: [
      "executive_summary",
      "problem_deep_dive",
      "target_personas",
      "mvp_features",
      "pricing_strategy",
      "go_to_market",
      "competitive_landscape",
      "risks_and_mitigations",
      "success_metrics",
    ],
  },
};
