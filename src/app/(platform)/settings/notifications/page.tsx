"use client";

import { useEffect, useState } from "react";
import { PlatformHeader } from "@/components/layout/platform-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LoadingState } from "@/components/shared/loading-state";

interface NotificationPrefs {
  signup_alerts: boolean;
  weekly_reports: boolean;
  milestone_alerts: boolean;
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    signup_alerts: true,
    weekly_reports: true,
    milestone_alerts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("id", user.id)
        .single();

      if (profile?.notification_preferences) {
        setPrefs(profile.notification_preferences as unknown as NotificationPrefs);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ notification_preferences: JSON.parse(JSON.stringify(prefs)) })
      .eq("id", user.id);

    setSaving(false);
  }

  if (loading) return <LoadingState message="Loading preferences..." />;

  const toggles: { key: keyof NotificationPrefs; label: string; description: string }[] = [
    {
      key: "signup_alerts",
      label: "Signup Alerts",
      description: "Get notified when someone signs up on your landing page",
    },
    {
      key: "weekly_reports",
      label: "Weekly Reports",
      description: "Receive a weekly summary of your validation metrics",
    },
    {
      key: "milestone_alerts",
      label: "Milestone Alerts",
      description: "Get notified when you hit signup milestones (10, 50, 100+)",
    },
  ];

  return (
    <>
      <PlatformHeader title="Notifications" description="Manage notification preferences" />
      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {toggles.map((t) => (
              <div key={t.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs[t.key]}
                  onClick={() => setPrefs((p) => ({ ...p, [t.key]: !p[t.key] }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    prefs[t.key] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      prefs[t.key] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
