"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChatInterface } from "@/components/chat/chat-interface";
import { LoadingState } from "@/components/shared/loading-state";

export default function ChatPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const supabase = createClient();

      // Find existing active session
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("id, extraction_complete")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        setSessionId(session.id);

        // Load message history
        const { data: messages } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("session_id", session.id)
          .order("created_at", { ascending: true });

        if (messages) {
          setInitialMessages(
            messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
        }
      }

      setLoading(false);
    }
    loadSession();
  }, [projectId]);

  function handleExtractionComplete() {
    router.refresh();
  }

  if (loading) return <LoadingState message="Loading chat..." />;

  return (
    <ChatInterface
      projectId={projectId}
      sessionId={sessionId}
      initialMessages={initialMessages}
      onExtractionComplete={handleExtractionComplete}
    />
  );
}
