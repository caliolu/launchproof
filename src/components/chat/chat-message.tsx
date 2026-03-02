import { cn } from "@/lib/utils/cn";
import { Bot, User } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/ai";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-[fadeIn_0.2s_ease-out]",
        isUser && "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary/10" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary" />
        ) : (
          <Bot className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground"
            : "bg-card border border-border/50 text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
