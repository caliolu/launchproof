import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamChat } from "@/lib/ai/claude-client";
import { phasePrompts, TOTAL_PHASES } from "@/lib/ai/prompts/coach-phases";
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

  // Determine current phase from number of user messages
  // Phase 1: 1st user msg, Phase 2: 2nd user msg, ... Phase 6: 6th user msg (extraction)
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const currentPhase = Math.min(userMessageCount, TOTAL_PHASES);
  let systemPrompt = phasePrompts[currentPhase] || phasePrompts[TOTAL_PHASES];

  // Inject market intelligence context if available
  const { data: marketResearch } = await supabase
    .from("project_market_research")
    .select("relevance_score, relevance_explanation, recommendation, opportunities(title, composite_score)")
    .eq("project_id", projectId)
    .gte("relevance_score", 50)
    .order("relevance_score", { ascending: false })
    .limit(5);

  if (marketResearch && marketResearch.length > 0) {
    const marketContext = marketResearch
      .map((r) => {
        const opp = r.opportunities as { title?: string; composite_score?: number } | null;
        return `- ${opp?.title || "Unknown"} (relevance: ${Math.round(r.relevance_score)}%, market score: ${opp?.composite_score || 0}): ${r.relevance_explanation || ""}`;
      })
      .join("\n");

    systemPrompt += `\n\n## Market Intelligence Context\nRelevant market signals found:\n${marketContext}\n\nReference this data when advising on market fit and competition. These signals are from real Reddit posts and product reviews.`;
  }

  // Update session's current_phase
  await supabase
    .from("chat_sessions")
    .update({ current_phase: currentPhase })
    .eq("id", chatSessionId);

  // Only provide the extraction tool in the final phase
  const tools = currentPhase >= TOTAL_PHASES ? [extractIdeaDetailsTool] : [];

  // SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      let toolCallData: { id: string; name: string; input: Record<string, unknown> } | null = null;

      // Send current phase info to frontend
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "phase", phase: currentPhase, total: TOTAL_PHASES })}\n\n`)
      );

      await streamChat({
        system: systemPrompt,
        messages,
        tools: tools.length > 0 ? tools : undefined,
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
