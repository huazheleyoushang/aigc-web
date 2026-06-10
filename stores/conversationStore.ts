"use client";

import { create } from "zustand";
import { getConversationRepository } from "@/lib/repositories";
import {
  createConversation,
  isEmptyConversation,
  isHistoryConversation,
} from "@/lib/utils";
import type { Conversation } from "@/types/domain";

const repo = getConversationRepository();
const ACTIVE_CONV_KEY = "aigc_active_conversation";

interface ConversationState {
  conversations: Conversation[];
  loaded: boolean;
  activeConversationId: string | null;
  load: (userId: string) => Promise<void>;
  getById: (id: string) => Conversation | undefined;
  ensure: (userId: string, id: string) => Promise<Conversation>;
  upsert: (conversation: Conversation) => Promise<void>;
  create: (userId: string) => Promise<Conversation>;
  getOrCreateEmpty: (userId: string) => Promise<Conversation>;
  remove: (userId: string, id: string) => Promise<void>;
  rename: (userId: string, id: string, title: string) => Promise<void>;
  togglePin: (userId: string, id: string) => Promise<void>;
  setActiveConversationId: (id: string) => void;
  initActive: (userId: string) => Promise<void>;
}

async function pruneExtraEmpty(userId: string, keepId?: string): Promise<void> {
  const all = await repo.list(userId);
  const empties = all.filter(isEmptyConversation);
  if (empties.length === 0) return;

  const keep = keepId ?? empties[0].id;
  await Promise.all(
    empties.filter((c) => c.id !== keep).map((c) => repo.delete(c.id)),
  );
}

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    const aPinned = a.pinned ? 1 : 0;
    const bPinned = b.pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    if (a.pinned && b.pinned) {
      return (b.pinnedAt ?? b.updatedAt) - (a.pinnedAt ?? a.updatedAt);
    }
    return b.updatedAt - a.updatedAt;
  });
}

function readCachedActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACTIVE_CONV_KEY);
}

function writeCachedActiveId(id: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACTIVE_CONV_KEY, id);
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  loaded: false,
  activeConversationId: null,

  setActiveConversationId(id) {
    writeCachedActiveId(id);
    set({ activeConversationId: id });
  },

  async initActive(userId) {
    if (!userId) return;

    if (!get().loaded) {
      await get().load(userId);
    }

    const cached = readCachedActiveId();
    const cachedValid =
      cached &&
      get().conversations.some((c) => c.id === cached && c.userId === userId);

    if (cachedValid) {
      set({ activeConversationId: cached });
      return;
    }

    const recent = get().conversations.find((c) => c.userId === userId);
    if (recent) {
      get().setActiveConversationId(recent.id);
      return;
    }

    const empty = await get().getOrCreateEmpty(userId);
    get().setActiveConversationId(empty.id);
  },

  async load(userId) {
    if (!userId) return;

    await pruneExtraEmpty(userId);
    const list = sortConversations(await repo.list(userId));
    set({ conversations: list, loaded: true });
  },

  getById(id) {
    return get().conversations.find((c) => c.id === id);
  },

  async ensure(userId, id) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!get().loaded) {
      await get().load(userId);
    }

    let conv = get().conversations.find(
      (c) => c.id === id && c.userId === userId,
    );

    if (!conv) {
      const fromRepo = await repo.get(id);
      if (fromRepo && fromRepo.userId === userId) {
        conv = fromRepo;
        set((s) => ({
          conversations: sortConversations([
            conv!,
            ...s.conversations.filter((c) => c.id !== id),
          ]),
        }));
      }
    }

    if (!conv) {
      conv = { ...createConversation(userId), id };
      await repo.save(conv);
      if (isEmptyConversation(conv)) {
        await pruneExtraEmpty(userId, conv.id);
      }
      const list = sortConversations(await repo.list(userId));
      set({ conversations: list, loaded: true });
      conv = list.find((c) => c.id === id) ?? conv;
    }

    return conv;
  },

  async upsert(conversation) {
    await repo.save(conversation);
    set((s) => {
      const index = s.conversations.findIndex(
        (c) => c.id === conversation.id,
      );
      if (index >= 0) {
        const next = [...s.conversations];
        next[index] = conversation;
        return { conversations: sortConversations(next) };
      }
      return { conversations: sortConversations([conversation, ...s.conversations]) };
    });
  },

  async create(userId) {
    const conv = createConversation(userId);
    await repo.save(conv);
    await pruneExtraEmpty(userId, conv.id);
    const list = sortConversations(await repo.list(userId));
    set({ conversations: list, loaded: true });
    return list.find((c) => c.id === conv.id) ?? conv;
  },

  async getOrCreateEmpty(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!get().loaded) {
      await get().load(userId);
    }

    const existing = get().conversations.find(
      (c) => c.userId === userId && isEmptyConversation(c),
    );
    if (existing) {
      await pruneExtraEmpty(userId, existing.id);
      const refreshed = (await repo.list(userId)).find(
        (c) => c.id === existing.id,
      );
      if (refreshed) {
        set({ conversations: sortConversations(await repo.list(userId)) });
        return refreshed;
      }
    }

    return get().create(userId);
  },

  async remove(userId, id) {
    if (!userId) return;

    const target = get().conversations.find((c) => c.id === id);
    if (!target || target.userId !== userId) return;

    await repo.delete(id);
    const list = sortConversations(
      (await repo.list(userId)).filter((c) => c.id !== id),
    );

    const updates: Partial<ConversationState> = { conversations: list };
    if (get().activeConversationId === id) {
      updates.activeConversationId = null;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(ACTIVE_CONV_KEY);
      }
    }
    set(updates);
  },

  async rename(userId, id, title) {
    const trimmed = title.trim();
    if (!userId || !trimmed) return;

    const conv = get().conversations.find((c) => c.id === id);
    if (!conv || conv.userId !== userId) return;

    await get().upsert({
      ...conv,
      title: trimmed,
      updatedAt: Date.now(),
    });
  },

  async togglePin(userId, id) {
    if (!userId) return;

    const conv = get().conversations.find((c) => c.id === id);
    if (!conv || conv.userId !== userId) return;

    const pinned = !conv.pinned;
    await get().upsert({
      ...conv,
      pinned,
      pinnedAt: pinned ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
  },
}));

/** 历史对话：已有消息的会话，置顶优先 */
export function selectHistoryConversations(
  conversations: Conversation[],
): Conversation[] {
  return sortConversations(conversations.filter(isHistoryConversation));
}
