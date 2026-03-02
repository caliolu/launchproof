import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const analyzeReviewsTool: Tool = {
  name: "analyze_reviews",
  description:
    "Analyze a batch of product reviews to extract weakness signals — feature gaps, churn reasons, and competitive intelligence for SaaS opportunities.",
  input_schema: {
    type: "object" as const,
    properties: {
      reviews: {
        type: "array",
        items: {
          type: "object",
          properties: {
            review_index: {
              type: "number",
              description: "Index of the review in the input batch (0-based)",
            },
            weakness_clusters: {
              type: "array",
              items: { type: "string" },
              description: "Categorized weakness types (e.g., 'Poor UX', 'Missing integrations')",
            },
            feature_gaps: {
              type: "array",
              items: { type: "string" },
              description: "Specific missing features or capabilities",
            },
            churn_reasons: {
              type: "array",
              items: { type: "string" },
              description: "Reasons the reviewer is considering leaving or has left",
            },
            affected_segment: {
              type: "string",
              description: "User segment most affected (e.g., 'small teams', 'enterprise')",
            },
            severity: {
              type: "string",
              enum: ["minor", "moderate", "major", "critical"],
              description: "How impactful this weakness is",
            },
            reasoning: {
              type: "string",
              description: "Brief explanation of the analysis",
            },
          },
          required: [
            "review_index",
            "weakness_clusters",
            "feature_gaps",
            "affected_segment",
            "severity",
            "reasoning",
          ],
        },
        description: "Analysis results for each review",
      },
    },
    required: ["reviews"],
  },
};
