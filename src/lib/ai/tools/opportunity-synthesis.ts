import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const synthesizeOpportunitiesTool: Tool = {
  name: "synthesize_opportunities",
  description:
    "Cross-reference demand signals (Reddit) and weakness signals (reviews) to identify actionable SaaS product opportunities. Score each opportunity across 5 dimensions.",
  input_schema: {
    type: "object" as const,
    properties: {
      opportunities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Short, catchy opportunity title (5-120 chars)",
            },
            description: {
              type: "string",
              description: "Clear description of the opportunity (20-500 chars)",
            },
            category: {
              type: "string",
              description: "SaaS category",
            },
            demand_score: { type: "number", description: "Demand strength 0-100" },
            weakness_score: { type: "number", description: "Existing solution weakness 0-100" },
            frequency_score: { type: "number", description: "How often this need appears 0-100" },
            wtp_score: { type: "number", description: "Willingness to pay 0-100" },
            feasibility_score: { type: "number", description: "How feasible to build 0-100" },
            problem_statement: { type: "string", description: "The core problem to solve" },
            target_audience: { type: "string", description: "Who this is for" },
            must_have_features: {
              type: "array",
              items: { type: "string" },
              description: "Minimum features for MVP",
            },
            suggested_pricing: { type: "string", description: "Recommended pricing model" },
            gtm_strategy: { type: "string", description: "Go-to-market approach" },
            competing_products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  weakness: { type: "string" },
                  url: { type: "string" },
                },
                required: ["name", "weakness"],
              },
              description: "Known competitors and their weaknesses",
            },
            industries: {
              type: "array",
              items: { type: "string" },
              description: "Relevant industries",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Tags for filtering and search",
            },
            supporting_signal_ids: {
              type: "array",
              items: { type: "string" },
              description: "IDs of signals that support this opportunity",
            },
          },
          required: [
            "title",
            "description",
            "category",
            "demand_score",
            "weakness_score",
            "frequency_score",
            "wtp_score",
            "feasibility_score",
            "problem_statement",
            "target_audience",
            "must_have_features",
            "suggested_pricing",
            "gtm_strategy",
          ],
        },
        description: "Generated opportunity objects",
      },
    },
    required: ["opportunities"],
  },
};
