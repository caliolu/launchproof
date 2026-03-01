import { Bot } from "lucide-react";

export function ChatTypingIndicator() {
  return (
    <div className="flex gap-3 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="rounded-2xl bg-muted px-4 py-3 flex gap-1">
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-[pulse-dot_1.4s_ease-in-out_infinite]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-[pulse-dot_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-[pulse-dot_1.4s_ease-in-out_0.4s_infinite]" />
      </div>
    </div>
  );
}
