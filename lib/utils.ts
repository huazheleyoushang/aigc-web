import { v4 as uuidv4 } from "uuid";
import type { Conversation, Message } from "@/types/domain";
import { getDefaultModel } from "@/config/models";

export function createId(): string {
  return uuidv4();
}

export function createMessage(
  role: Message["role"],
  content: string,
  status: Message["status"] = "done",
): Message {
  return {
    id: createId(),
    role,
    content,
    status,
    createdAt: Date.now(),
  };
}

export function createConversation(userId: string): Conversation {
  const now = Date.now();
  return {
    id: createId(),
    userId,
    title: "新对话",
    model: getDefaultModel().id,
    messages: [],
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function deriveTitle(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "新对话";
  return trimmed.length > 20 ? `${trimmed.slice(0, 20)}…` : trimmed;
}

export function isEmptyConversation(conversation: Conversation): boolean {
  return conversation.messages.length === 0;
}

export function isHistoryConversation(conversation: Conversation): boolean {
  return conversation.messages.length > 0;
}
