"use client";

import { useState, useRef } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || isStreaming) return;
    onSend(value.trim());
    setValue("");
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-card">
      <div className="flex gap-2 items-end max-w-3xl mx-auto bg-card rounded-2xl border border-border/50 shadow-sm p-2 focus-within:ring-1 focus-within:ring-primary/20 transition-shadow">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your idea..."
          className="flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none min-h-[44px] max-h-[200px]"
          rows={1}
          disabled={disabled}
        />
        {isStreaming ? (
          <Button type="button" variant="outline" size="icon" onClick={onStop}>
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!value.trim() || disabled} className="bg-gradient-to-r from-primary to-purple-500 hover:brightness-110">
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
