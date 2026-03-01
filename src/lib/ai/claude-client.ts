import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, Tool } from "@anthropic-ai/sdk/resources/messages";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface StreamChatOptions {
  system: string;
  messages: MessageParam[];
  tools?: Tool[];
  maxTokens?: number;
  onText: (text: string) => void;
  onToolUse: (toolCall: { id: string; name: string; input: Record<string, unknown> }) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export async function streamChat({
  system,
  messages,
  tools,
  maxTokens = 1024,
  onText,
  onToolUse,
  onDone,
  onError,
}: StreamChatOptions) {
  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages,
      tools: tools?.length ? tools : undefined,
    });

    stream.on("text", (text) => onText(text));

    stream.on("contentBlock", (block) => {
      if (block.type === "tool_use") {
        onToolUse({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    });

    stream.on("end", () => onDone());
    stream.on("error", (error) => onError(error));

    await stream.finalMessage();
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export async function generateContent(
  system: string,
  messages: MessageParam[],
  tools?: Tool[],
  maxTokens = 4096
) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system,
    messages,
    tools: tools?.length ? tools : undefined,
  });

  return response;
}
