import type { Conversation } from "@/types/domain";
import type { ConversationRepository } from "@/lib/repositories/types";

const STORAGE_KEY = "aigc_conversations";

function readAll(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

function writeAll(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export const localStorageConversationRepository: ConversationRepository = {
  async list(userId: string) {
    return readAll()
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async get(id: string) {
    return readAll().find((c) => c.id === id) ?? null;
  },

  async save(conversation: Conversation) {
    const all = readAll();
    const index = all.findIndex((c) => c.id === conversation.id);
    if (index >= 0) {
      all[index] = conversation;
    } else {
      all.push(conversation);
    }
    writeAll(all);
  },

  async delete(id: string) {
    writeAll(readAll().filter((c) => c.id !== id));
  },
};
