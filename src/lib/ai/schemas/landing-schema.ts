import { z } from "zod";

export const landingPageContentSchema = z.object({
  hero: z.object({
    headline: z.string().min(5).max(200),
    subheadline: z.string().min(10).max(500),
    ctaText: z.string().min(2).max(100),
    imagePrompt: z.string().min(10).max(500),
  }),
  problem: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(500),
    painPoints: z.array(z.string().min(3).max(200)).min(2).max(5),
  }),
  solution: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(500),
    features: z
      .array(
        z.object({
          title: z.string().min(2).max(100),
          description: z.string().min(5).max(300),
        })
      )
      .min(2)
      .max(6),
  }),
  socialProof: z
    .object({
      title: z.string().max(200),
      testimonials: z
        .array(
          z.object({
            quote: z.string().min(10).max(500),
            author: z.string().min(2).max(100),
            role: z.string().min(2).max(100),
          })
        )
        .min(1)
        .max(3),
    })
    .optional(),
  cta: z.object({
    headline: z.string().min(3).max(200),
    description: z.string().min(5).max(500),
    buttonText: z.string().min(2).max(100),
    type: z.enum(["waitlist", "preorder", "demo", "custom"]),
  }),
  faq: z
    .array(
      z.object({
        question: z.string().min(5).max(300),
        answer: z.string().min(10).max(1000),
      })
    )
    .optional(),
});

export type LandingPageContentInput = z.input<typeof landingPageContentSchema>;
