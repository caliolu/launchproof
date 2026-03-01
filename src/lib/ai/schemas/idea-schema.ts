import { z } from "zod";

export const ideaSummarySchema = z.object({
  productName: z.string().min(1).max(100),
  oneLiner: z.string().min(10).max(200),
  problemStatement: z.string().min(10).max(500),
  targetAudience: z.string().min(5).max(300),
  valueProposition: z.string().min(10).max(500),
  keyFeatures: z.array(z.string().min(3).max(200)).min(2).max(8),
  industry: z.string().min(2).max(100),
  monetizationModel: z.string().min(3).max(200),
  toneAndStyle: z.string().min(3).max(200),
  ctaType: z.enum(["waitlist", "preorder", "demo", "custom"]),
  ctaText: z.string().min(2).max(100),
});

export type IdeaSummaryInput = z.input<typeof ideaSummarySchema>;
