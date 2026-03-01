import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const generateMultiChannelAdsTool: Tool = {
  name: "generate_multi_channel_ads",
  description: "Generate ad content for multiple advertising channels (Google, Facebook, Instagram, Reddit, Twitter) based on the startup idea.",
  input_schema: {
    type: "object" as const,
    properties: {
      ads: {
        type: "array",
        items: {
          type: "object",
          properties: {
            channel: {
              type: "string",
              enum: ["google_search", "facebook", "instagram", "reddit", "twitter"],
            },
            recommended: { type: "boolean" },
            recommendationReason: { type: "string" },
            content: {
              type: "object",
              description: "Channel-specific ad content. Structure varies by channel.",
            },
          },
          required: ["channel", "recommended", "recommendationReason", "content"],
        },
      },
    },
    required: ["ads"],
  },
};
