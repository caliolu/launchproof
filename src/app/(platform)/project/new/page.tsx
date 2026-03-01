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

    router.push(`/project/${data.id}/chat`);
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
