"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { ChatTypingIndicator } from "./chat-typing-indicator";
import { ChatInput } from "./chat-input";
import { IdeaSummaryCard } from "./idea-summary-card";
import { MessageSquare } from "lucide-react";
import type { IdeaSummary } from "@/types/ai";

interface ChatInterfaceProps {
  projectId: string;
  sessionId?: string | null;
  initialMessages?: Array<{ role: "user" | "assistant"; content: string }>;
  initialIdea?: string;
  onExtractionComplete?: (data: IdeaSummary) => void;
}

export function ChatInterface({
  projectId,
  sessionId: initialSessionId,
  initialMessages,
  initialIdea,
  onExtractionComplete,
}: ChatInterfaceProps) {
  const {
    messages,
    setMessages,
    isStreaming,
    extractedIdea,
    currentPhase,
    sendMessage,
    stopStreaming,
  } = useChat({
    projectId,
    sessionId: initialSessionId,
    onExtractionComplete,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const ideaSentRef = useRef(false);

  useEffect(() => {
    if (initialMessages?.length) {
      setMessages(
        initialMessages.map((m) => ({
          id: crypto.randomUUID(),
          role: m.role,
          content: m.content,
          createdAt: new Date().toISOString(),
        }))
      );
    } else if (initialIdea && !ideaSentRef.current) {
      // Auto-send the idea as the first message
      ideaSentRef.current = true;
      sendMessage(initialIdea);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isStreaming]);

  const phaseLabels = ["Idea & Problem", "Target Audience", "Value Proposition", "Monetization", "Tone & CTA"];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Phase progress bar */}
      {currentPhase && currentPhase.phase < currentPhase.total && (
        <div className="px-4 pt-3 pb-1">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-1.5">
              {phaseLabels.map((label, i) => {
                const step = i + 1;
                const isComplete = currentPhase.phase > step;
                const isCurrent = currentPhase.phase === step;
                return (
                  <div key={label} className="flex-1">
                    <div
                      className={`h-1.5 rounded-full transition-colors ${
                        isComplete
                          ? "bg-primary"
                          : isCurrent
                            ? "bg-primary/50"
                            : "bg-muted"
                      }`}
                    />
                    <p
                      className={`text-[10px] mt-0.5 truncate ${
                        isComplete || isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">AI Idea Coach</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Tell me about your startup idea and I&apos;ll help you refine it
                into a compelling pitch.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isStreaming &&
            messages.length > 0 &&
            !messages[messages.length - 1].content && (
              <ChatTypingIndicator />
            )}

          {extractedIdea && <IdeaSummaryCard idea={extractedIdea} />}
        </div>
      </div>

      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
        disabled={!!extractedIdea}
      />
    </div>
  );
}
