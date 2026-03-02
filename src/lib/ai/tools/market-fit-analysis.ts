import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const analyzeMarketFitTool: Tool = {
  name: "analyze_market_fit",
  description:
    "Analyze how relevant existing market opportunities are to a user's specific project idea. Score each opportunity for relevance and provide actionable recommendations.",
  input_schema: {
    type: "object" as const,
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            opportunity_id: {
              type: "string",
              description: "The ID of the opportunity being analyzed",
            },
            relevance_score: {
              type: "number",
              description: "How relevant this opportunity is to the user's idea (0-100)",
            },
            relevance_explanation: {
              type: "string",
              description: "Why this opportunity is or isn't relevant",
            },
            fit_level: {
              type: "string",
              enum: ["strong", "partial", "weak"],
              description: "Overall fit categorization",
            },
            overlap_areas: {
              type: "array",
              items: { type: "string" },
              description: "Specific areas of overlap between the idea and this opportunity",
            },
            differentiation_opportunities: {
              type: "array",
              items: { type: "string" },
              description: "How the user's idea could differentiate",
            },
            market_size_indicator: {
              type: "string",
              description: "Brief market size assessment based on signal volume",
            },
            competitive_advantages: {
              type: "array",
              items: { type: "string" },
              description: "Advantages the user's specific angle offers",
            },
            risks: {
              type: "array",
              items: { type: "string" },
              description: "Risks to be aware of based on market signals",
            },
            recommendation: {
              type: "string",
              description: "1-2 sentence actionable recommendation",
            },
          },
          required: [
            "opportunity_id",
            "relevance_score",
            "relevance_explanation",
            "fit_level",
            "overlap_areas",
            "differentiation_opportunities",
            "market_size_indicator",
            "competitive_advantages",
            "risks",
            "recommendation",
          ],
        },
        description: "Market fit analysis for each opportunity",
      },
    },
    required: ["results"],
  },
};
