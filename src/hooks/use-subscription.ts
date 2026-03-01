"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPlan } from "@/config/plans";

interface SubscriptionState {
  plan: "free" | "starter" | "pro";
  canCreateProject: boolean;
  adsEnabled: boolean;
  loading: boolean;
}

export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    plan: "free",
    canCreateProject: true,
    adsEnabled: false,
    loading: true,
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState((s) => ({ ...s, loading: false }));
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      const plan = (profile?.plan as "free" | "starter" | "pro") || "free";
      const planConfig = getPlan(plan);

      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const projectCount = count || 0;

      setState({
        plan,
        canCreateProject: projectCount < planConfig.limits.projects,
        adsEnabled: planConfig.limits.adsEnabled,
        loading: false,
      });
    }
    load();
  }, []);

  return state;
}
