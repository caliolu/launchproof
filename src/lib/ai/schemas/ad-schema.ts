import { z } from "zod";

export const adContentSchema = z.object({
  channel: z.enum(["google_search", "facebook", "instagram", "reddit", "twitter"]),
  recommended: z.boolean(),
  recommendationReason: z.string(),
  content: z.record(z.string(), z.unknown()),
});

export const multiChannelAdSchema = z.object({
  ads: z.array(adContentSchema).min(1).max(5),
});

export type AdContentInput = z.input<typeof adContentSchema>;
