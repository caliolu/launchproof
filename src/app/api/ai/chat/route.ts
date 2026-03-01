import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamChat } from "@/lib/ai/claude-client";
import { coachSystemPrompt } from "@/lib/ai/prompts/coach-system";
import { extractIdeaDetailsTool } from "@/lib/ai/tools/idea-extraction";
import { ideaSummarySchema } from "@/lib/ai/schemas/idea-schema";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import type { Json } from "@/types/database";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, sessionId, message } = await request.json();
  if (!projectId || !message) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  // Get or create session
  let chatSessionId = sessionId;
  if (!chatSessionId) {
    const { data } = await supabase
      .from("chat_sessions")
      .insert({ project_id: projectId, user_id: user.id })
      .select("id")
      .single();
    chatSessionId = data?.id;
  }

  // Save user message
  await supabase.from("chat_messages").insert({
    session_id: chatSessionId,
    role: "user",
    content: message,
  });

  // Load message history
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", chatSessionId)
    .order("created_at", { ascending: true });

  const messages: MessageParam[] = (history || []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      let toolCallData: { id: string; name: string; input: Record<string, unknown> } | null = null;

      await streamChat({
        system: coachSystemPrompt,
        messages,
        tools: [extractIdeaDetailsTool],
        onText: (text) => {
          fullResponse += text;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`)
          );
        },
        onToolUse: (toolCall) => {
          toolCallData = toolCall;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "tool_use", name: toolCall.name, input: toolCall.input })}\n\n`
            )
          );
        },
        onDone: async () => {
          // Save assistant message
          if (fullResponse) {
            await supabase.from("chat_messages").insert({
              session_id: chatSessionId,
              role: "assistant",
              content: fullResponse,
              tool_calls: toolCallData ? JSON.parse(JSON.stringify([toolCallData])) as Json : null,
            });
          }

          // Handle tool use: validate and save idea extraction
          if (toolCallData?.name === "extract_idea_details") {
            const parsed = ideaSummarySchema.safeParse(toolCallData.input);
            if (parsed.success) {
              await supabase
                .from("projects")
                .update({
                  idea_summary: JSON.parse(JSON.stringify(parsed.data)) as Json,
                  target_audience: parsed.data.targetAudience,
                  problem_statement: parsed.data.problemStatement,
                  value_proposition: parsed.data.valueProposition,
                  industry: parsed.data.industry,
                })
                .eq("id", projectId);

              await supabase
                .from("chat_sessions")
                .update({ extraction_complete: true, status: "completed" })
                .eq("id", chatSessionId);

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "extraction_complete", data: parsed.data })}\n\n`
                )
              );
            } else {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "extraction_error", errors: parsed.error.issues })}\n\n`
                )
              );
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        },
        onError: (error) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`
            )
          );
          controller.close();
        },
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
