import { APP_CONFIG } from "@/config/app";
import type { ChatMessagePayload } from "@/types/domain";

/** Rough token estimate for MVP (chars / 2). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 2);
}

export function estimateMessagesTokens(messages: ChatMessagePayload[]): number {
  return messages.reduce((sum, m) => sum + estimateTokens(m.content) + 4, 0);
}

export function buildContext(
  messages: ChatMessagePayload[],
  options?: {
    maxTokens?: number;
    budgetRatio?: number;
    preserveSystem?: boolean;
  },
): ChatMessagePayload[] {
  const maxTokens = options?.maxTokens ?? APP_CONFIG.maxContextTokens;
  const budgetRatio = options?.budgetRatio ?? APP_CONFIG.contextBudgetRatio;
  const budget = Math.floor(maxTokens * budgetRatio);
  const preserveSystem = options?.preserveSystem ?? true;

  const systemMessages = preserveSystem
    ? messages.filter((m) => m.role === "system")
    : [];
  const nonSystem = messages.filter((m) => m.role !== "system");

  let used = estimateMessagesTokens(systemMessages);
  const selected: ChatMessagePayload[] = [];

  for (let i = nonSystem.length - 1; i >= 0; i--) {
    const msg = nonSystem[i];
    const cost = estimateTokens(msg.content) + 4;
    if (used + cost > budget) break;
    selected.unshift(msg);
    used += cost;
  }

  return [...systemMessages, ...selected];
}
