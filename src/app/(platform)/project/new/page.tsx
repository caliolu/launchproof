"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PlatformHeader } from "@/components/layout/platform-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { generateUniqueSlug } from "@/lib/utils/slugify";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const slug = generateUniqueSlug(name);
    const { data, error: dbError } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name, slug })
      .select("id")
      .single();

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    // Pass idea description as query param so chat can use it as first message
    const params = idea.trim() ? `?idea=${encodeURIComponent(idea.trim())}` : "";
    router.push(`/project/${data.id}/chat${params}`);
  }

  return (
    <>
      <PlatformHeader title="New Project" />
      <div className="p-6 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Create a new project</CardTitle>
            <CardDescription>
              Give your idea a name to get started. You&apos;ll refine everything
              with the AI Coach.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Project name
                </label>
                <Input
                  id="name"
                  placeholder="e.g. Meal Prep AI, Freelancer CRM..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  This is just for you — visitors won&apos;t see this name.
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="idea" className="text-sm font-medium">
                  Describe your idea
                </label>
                <textarea
                  id="idea"
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-none"
                  placeholder="e.g. An app that calls elderly parents daily using AI to check on their health and mood, then sends a summary to their children..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  The AI Coach will use this to start the conversation.
                </p>
              </div>
              <Button type="submit" className="w-full" loading={loading}>
                Create & start chatting
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
