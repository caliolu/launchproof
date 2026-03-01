export interface PlanConfig {
  id: "free" | "starter" | "pro";
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  stripePriceId: string;
  limits: {
    projects: number;
    adsEnabled: boolean;
    customDomain: boolean;
    analytics: "basic" | "advanced";
    support: "community" | "email" | "priority";
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
      adsEnabled: false,
      customDomain: false,
      analytics: "basic",
      support: "community",
    },
    features: [
      "1 validation test",
      "AI Idea Coach",
      "Landing page generation",
      "Basic analytics",
      "Up to 100 signups",
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
      adsEnabled: true,
      customDomain: false,
      analytics: "advanced",
      support: "email",
    },
    features: [
      "1 validation test",
      "AI Idea Coach",
      "Landing page generation",
      "AI Ad Strategist",
      "Advanced analytics",
      "Unlimited signups",
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
      adsEnabled: true,
      customDomain: true,
      analytics: "advanced",
      support: "priority",
    },
    features: [
      "Unlimited validation tests",
      "AI Idea Coach",
      "Landing page generation",
      "AI Ad Strategist",
      "Advanced analytics",
      "Unlimited signups",
      "CSV export",
      "Custom domains",
      "Priority support",
    ],
  },
];

export function getPlan(planId: string): PlanConfig {
  return plans.find((p) => p.id === planId) || plans[0];
}
