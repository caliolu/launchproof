"use client";

import { useRouter } from "next/navigation";
import { PricingTable } from "@/components/billing/pricing-table";
import type { PlanConfig } from "@/config/plans";

export default function PricingPage() {
  const router = useRouter();

  function handleSelectPlan(plan: PlanConfig) {
    router.push(plan.id === "free" ? "/signup" : `/signup?plan=${plan.id}`);
  }

  return (
    <section className="py-24 px-4">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-primary mb-2">PRICING</p>
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Start free. Upgrade when you need more power.
        </p>
      </div>
      <PricingTable onSelectPlan={handleSelectPlan} />
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <h3 className="font-semibold mb-4">Frequently asked questions</h3>
        <div className="space-y-4 text-left">
          {[
            {
              q: "Can I use LaunchProof for free?",
              a: "Yes! The free plan lets you create 1 project with full AI coach, landing page, and analytics features.",
            },
            {
              q: "What happens when my test is complete?",
              a: "Your landing page stays live and you keep all your data. You can export signups as CSV anytime.",
            },
            {
              q: "Can I cancel my subscription?",
              a: "Yes, you can cancel anytime from your billing settings. You'll keep access until the end of your billing period.",
            },
            {
              q: "Do I need design or coding skills?",
              a: "Not at all. AI generates everything — landing page copy, design, and ad content. You just describe your idea.",
            },
          ].map((faq) => (
            <details key={faq.q} className="group border border-border rounded-lg">
              <summary className="cursor-pointer p-4 font-medium text-sm flex items-center justify-between">
                {faq.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  &#9660;
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
