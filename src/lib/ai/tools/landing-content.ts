import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const generateLandingContentTool: Tool = {
  name: "generate_landing_content",
  description: "Generate structured landing page content from the startup idea summary. This content will be rendered using templates.",
  input_schema: {
    type: "object" as const,
    properties: {
      hero: {
        type: "object",
        properties: {
          headline: { type: "string", description: "Bold, benefit-driven headline (6-12 words)" },
          subheadline: { type: "string", description: "Expanding on the headline with specifics" },
          ctaText: { type: "string", description: "CTA button text" },
          imagePrompt: { type: "string", description: "AI image generation prompt for hero image" },
        },
        required: ["headline", "subheadline", "ctaText", "imagePrompt"],
      },
      problem: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          painPoints: { type: "array", items: { type: "string" } },
        },
        required: ["title", "description", "painPoints"],
      },
      solution: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          features: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
              required: ["title", "description"],
            },
          },
        },
        required: ["title", "description", "features"],
      },
      socialProof: {
        type: "object",
        properties: {
          title: { type: "string" },
          testimonials: {
            type: "array",
            items: {
              type: "object",
              properties: {
                quote: { type: "string" },
                author: { type: "string" },
                role: { type: "string" },
              },
              required: ["quote", "author", "role"],
            },
          },
        },
        required: ["title", "testimonials"],
      },
      cta: {
        type: "object",
        properties: {
          headline: { type: "string" },
          description: { type: "string" },
          buttonText: { type: "string" },
          type: { type: "string", enum: ["waitlist", "preorder", "demo", "custom"] },
        },
        required: ["headline", "description", "buttonText", "type"],
      },
      faq: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question", "answer"],
        },
      },
    },
    required: ["hero", "problem", "solution", "cta"],
  },
};
