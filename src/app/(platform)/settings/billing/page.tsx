"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { PlatformHeader } from "@/components/layout/platform-header";
import { PricingTable } from "@/components/billing/pricing-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlanConfig } from "@/config/plans";

export default function BillingPage() {
  const { profile } = useUser();
  const [loading, setLoading] = useState(false);

  async function handleSelectPlan(plan: PlanConfig) {
    if (plan.id === "free" || !plan.stripePriceId) return;

    setLoading(true);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: plan.stripePriceId }),
    });

    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    }
    setLoading(false);
  }

  async function handleManageBilling() {
    setLoading(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    }
    setLoading(false);
  }

  return (
    <>
      <PlatformHeader title="Billing" description="Manage your subscription" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Current Plan
              <Badge variant={profile?.plan === "pro" ? "success" : profile?.plan === "starter" ? "default" : "secondary"}>
                {profile?.plan || "free"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.plan !== "free" && (
              <Button variant="outline" onClick={handleManageBilling} loading={loading}>
                Manage subscription
              </Button>
            )}
          </CardContent>
        </Card>

        <PricingTable
          currentPlan={profile?.plan}
          onSelectPlan={handleSelectPlan}
          loading={loading}
        />
      </div>
    </>
  );
}
