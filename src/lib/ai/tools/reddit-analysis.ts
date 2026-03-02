import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const analyzeRedditPostsTool: Tool = {
  name: "analyze_reddit_posts",
  description:
    "Analyze a batch of Reddit posts to extract demand signals for SaaS opportunities. Identify pain points, desired features, urgency, willingness to pay, and an opportunity score for each post.",
  input_schema: {
    type: "object" as const,
    properties: {
      posts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            post_id: {
              type: "string",
              description: "The Reddit post ID",
            },
            category: {
              type: "string",
              description: "SaaS category (e.g., 'Project Management', 'CRM & Sales')",
            },
            pain_point: {
              type: "string",
              description: "The core problem or frustration expressed",
            },
            desired_features: {
              type: "array",
              items: { type: "string" },
              description: "Specific features the user wants",
            },
            urgency: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "How urgently the user needs a solution",
            },
            willingness_to_pay: {
              type: "string",
              enum: ["none", "low", "medium", "high"],
              description: "Likelihood of paying for a solution",
            },
            budget_range: {
              type: "string",
              description: "Specific budget or price range if mentioned",
            },
            opportunity_score: {
              type: "number",
              description: "Opportunity strength score from 1-10",
            },
            reasoning: {
              type: "string",
              description: "Brief explanation of the score",
            },
          },
          required: [
            "post_id",
            "category",
            "pain_point",
            "urgency",
            "willingness_to_pay",
            "opportunity_score",
            "reasoning",
          ],
        },
        description: "Analysis results for each post",
      },
    },
    required: ["posts"],
  },
};
