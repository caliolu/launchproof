export interface IdeaSummary {
  productName: string;
  oneLiner: string;
  problemStatement: string;
  targetAudience: string;
  valueProposition: string;
  keyFeatures: string[];
  industry: string;
  monetizationModel: string;
  toneAndStyle: string;
  ctaType: "waitlist" | "preorder" | "demo" | "custom";
  ctaText: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  content: unknown;
}

export interface ChatPhase {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

export const CHAT_PHASES: ChatPhase[] = [
  { id: 1, name: "Idea Core", description: "What's the big idea?", completed: false },
  { id: 2, name: "Target Audience", description: "Who is this for?", completed: false },
  { id: 3, name: "Value Proposition", description: "Why would they care?", completed: false },
  { id: 4, name: "Monetization", description: "How does it make money?", completed: false },
  { id: 5, name: "Tone & CTA", description: "How should we present it?", completed: false },
];
