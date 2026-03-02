"use client";

import { useCallback, useRef, useState } from "react";
import type { IdeaSummary, ChatMessage } from "@/types/ai";

interface UseChatOptions {
  projectId: string;
  sessionId?: string | null;
  onExtractionComplete?: (data: IdeaSummary) => void;
}

export function useChat({ projectId, sessionId: initialSessionId, onExtractionComplete }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [extractedIdea, setExtractedIdea] = useState<IdeaSummary | null>(null);
  const [currentPhase, setCurrentPhase] = useState<{ phase: number; total: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, sessionId, message: content }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Chat request failed");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case "session":
                setSessionId(data.sessionId);
                break;

              case "phase":
                setCurrentPhase({ phase: data.phase, total: data.total });
                break;

              case "text":
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + data.content,
                    };
                  }
                  return updated;
                });
                break;

              case "extraction_complete":
                setExtractedIdea(data.data);
                onExtractionComplete?.(data.data);
                break;

              case "tool_use":
                if (data.name === "extract_idea_details") {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last.role === "assistant") {
                      updated[updated.length - 1] = {
                        ...last,
                        toolCalls: [{ id: crypto.randomUUID(), name: data.name, input: data.input }],
                      };
                    }
                    return updated;
                  });
                }
                break;

              case "done":
                break;

              case "error":
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: "Sorry, something went wrong. Please try again.",
                    };
                  }
                  return updated;
                });
                break;
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant" && !last.content) {
              updated[updated.length - 1] = {
                ...last,
                content: "Failed to connect. Please try again.",
              };
            }
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [projectId, sessionId, isStreaming, onExtractionComplete]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    messages,
    setMessages,
    isStreaming,
    sessionId,
    setSessionId,
    extractedIdea,
    currentPhase,
    sendMessage,
    stopStreaming,
  };
}
