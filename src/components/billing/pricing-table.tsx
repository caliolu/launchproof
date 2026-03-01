"use client";

import { plans, type PlanConfig } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PricingTableProps {
  currentPlan?: string;
  onSelectPlan: (plan: PlanConfig) => void;
  loading?: boolean;
}

export function PricingTable({ currentPlan = "free", onSelectPlan, loading }: PricingTableProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            "relative",
            plan.popular && "border-primary shadow-lg"
          )}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge>Most Popular</Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="pt-2">
              <span className="text-3xl font-bold">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
              </span>
              {plan.price > 0 && (
                <span className="text-sm text-muted-foreground ml-1">
                  {plan.id === "starter" ? "/ test" : "/ month"}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.id === currentPlan ? "outline" : plan.popular ? "default" : "outline"}
              onClick={() => onSelectPlan(plan)}
              disabled={plan.id === currentPlan}
              loading={loading}
            >
              {plan.id === currentPlan ? "Current plan" : plan.price === 0 ? "Get started" : "Upgrade"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
