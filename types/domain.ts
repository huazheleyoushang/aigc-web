export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "pending" | "streaming" | "done" | "error" | "stopped";

export interface User {
  id: string;
  username: string;
  createdAt: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  reasoning?: string;
  status: MessageStatus;
  createdAt: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  model: string;
  messages: Message[];
  pinned?: boolean;
  pinnedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessagePayload {
  role: MessageRole;
  content: string;
}
