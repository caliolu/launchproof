export interface Subscription {
  id: string;
  status: "active" | "inactive" | "trialing" | "past_due" | "canceled" | "unpaid";
  plan: "free" | "starter" | "pro";
  currentPeriodEnd: string | null;
  cancelAt: string | null;
}

export interface UsageInfo {
  projectsUsed: number;
  projectsLimit: number;
  adsEnabled: boolean;
}
