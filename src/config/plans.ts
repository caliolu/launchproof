export interface PlanConfig {
  id: "free" | "starter" | "pro";
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  stripePriceId: string;
  limits: {
    projects: number;
    maxSignups: number;
    adsEnabled: boolean;
    publishEnabled: boolean;
    customDomain: boolean;
    watermark: boolean;
    analytics: "basic" | "advanced";
    support: "community" | "email" | "priority";
    marketResearch: boolean;
    scansPerDay: number;
  };
  features: string[];
  popular?: boolean;
}

export const plans: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    description: "Try one idea, see if it sticks",
    price: 0,
    priceLabel: "Free forever",
    stripePriceId: "",
    limits: {
      projects: 1,
      maxSignups: 0,
      adsEnabled: false,
      publishEnabled: false,
      customDomain: false,
      watermark: true,
      analytics: "basic",
      support: "community",
      marketResearch: false,
      scansPerDay: 0,
    },
    features: [
      "1 validation test",
      "AI Idea Coach",
      "Landing page preview",
      "Basic analytics",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    description: "Validate a single idea with full tools",
    price: 29,
    priceLabel: "$29 / test",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || "",
    limits: {
      projects: 1,
      maxSignups: 100,
      adsEnabled: true,
      publishEnabled: true,
      customDomain: false,
      watermark: true,
      analytics: "advanced",
      support: "email",
      marketResearch: false,
      scansPerDay: 0,
    },
    features: [
      "1 validation test",
      "AI Idea Coach",
      "Landing page generation + publish",
      "AI Ad Strategist",
      "Advanced analytics",
      "Up to 100 signups",
      "CSV export",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Unlimited testing for serial entrepreneurs",
    price: 79,
    priceLabel: "$79 / month",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    limits: {
      projects: Infinity,
      maxSignups: Infinity,
      adsEnabled: true,
      publishEnabled: true,
      customDomain: true,
      watermark: false,
      analytics: "advanced",
      support: "priority",
      marketResearch: true,
      scansPerDay: 3,
    },
    features: [
      "Unlimited validation tests",
      "AI Idea Coach",
      "Landing page generation + publish",
      "AI Ad Strategist",
      "Advanced analytics",
      "Unlimited signups",
      "CSV export",
      "No watermark",
      "Custom domains",
      "Priority support",
      "SaaS Opportunity Scanner",
      "Market Research & AI Product Briefs",
    ],
  },
];

export function getPlan(planId: string): PlanConfig {
  return plans.find((p) => p.id === planId) || plans[0];
}
