"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Rocket, Lightbulb, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "Describe Your Idea",
    description: "Chat with our AI Coach to define your product, audience, and value proposition.",
  },
  {
    icon: Rocket,
    title: "Launch a Landing Page",
    description: "AI generates a beautiful, conversion-optimized landing page in seconds.",
  },
  {
    icon: BarChart3,
    title: "Track & Validate",
    description: "Drive real traffic, collect signups, and get a validation score.",
  },
];

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleComplete() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to LaunchProof</CardTitle>
          <CardDescription>
            Here&apos;s how you&apos;ll validate your idea in 3 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-primary" />
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
          <Button className="w-full mt-4" onClick={handleComplete} loading={loading}>
            Get started
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
