"use client";

import { useCallback, useEffect, useState } from "react";
import { useChatStream } from "@/features/chat/hooks/useChatStream";
import { createMessage, deriveTitle } from "@/lib/utils";
import { useChatRuntimeStore } from "@/stores/chatRuntimeStore";
import { useConversationStore } from "@/stores/conversationStore";
import { resolveModel } from "@/config/models";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Conversation, Message } from "@/types/domain";

const DEFAULT_SYSTEM_PROMPT =
  "你是一个有帮助的 AI 助手，请用简洁清晰的中文回答用户问题。涉及对比、优缺点、方案差异等内容时，优先使用 Markdown 表格展示；代码请使用围栏代码块并标注语言。";

export function useChat(conversationId: string, userId: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const { streamChat } = useChatStream();
  const modelSetting = useSettingsStore((s) => s.model);
  const model = resolveModel(modelSetting);
  const ensure = useConversationStore((s) => s.ensure);
  const upsert = useConversationStore((s) => s.upsert);
  const {
    isGenerating,
    error,
    setGenerating,
    setAbortController,
    setError,
    reset,
  } = useChatRuntimeStore();

  useEffect(() => {
    if (!userId || !conversationId) return;

    let active = true;
    ensure(userId, conversationId)
      .then((conv) => {
        if (active) setConversation(conv);
      })
      .catch(() => {
        if (active) setConversation(null);
      });

    return () => {
      active = false;
      reset();
    };
  }, [conversationId, userId, ensure, reset]);

  const persist = useCallback(
    async (conv: Conversation) => {
      setConversation(conv);
      await upsert(conv);
    },
    [upsert],
  );

  const buildRequestMessages = useCallback((messages: Message[]) => {
    const history = messages
      .filter((m) => m.role !== "system" && m.status === "done")
      .map((m) => ({ role: m.role, content: m.content }));
    return [
      { role: "system" as const, content: DEFAULT_SYSTEM_PROMPT },
      ...history,
    ];
  }, []);

  const runAssistantStream = useCallback(
    async (initial: Conversation, assistantMsg: Message) => {
      let working = initial;

      setError(null);
      setGenerating(true);

      const controller = new AbortController();
      setAbortController(controller);

      await streamChat(
        {
          conversationId: working.id,
          messages: buildRequestMessages(working.messages.slice(0, -1)),
          model,
        },
        {
          onThinking: (delta) => {
            working = {
              ...working,
              messages: working.messages.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      reasoning: (m.reasoning ?? "") + delta,
                      status: "streaming" as const,
                    }
                  : m,
              ),
            };
            setConversation({ ...working });
          },
          onContent: (delta) => {
            working = {
              ...working,
              messages: working.messages.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content: m.content + delta,
                      status: "streaming" as const,
                    }
                  : m,
              ),
            };
            setConversation({ ...working });
          },
          onDone: async () => {
            working = {
              ...working,
              messages: working.messages.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, status: "done" as const }
                  : m,
              ),
              updatedAt: Date.now(),
            };
            await persist(working);
            setGenerating(false);
            setAbortController(null);
          },
          onError: async (message) => {
            working = {
              ...working,
              messages: working.messages.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content: m.content || message,
                      status: "error" as const,
                    }
                  : m,
              ),
            };
            await persist(working);
            setError(message);
            setGenerating(false);
            setAbortController(null);
          },
        },
        controller.signal,
      );
    },
    [
      buildRequestMessages,
      model,
      persist,
      setAbortController,
      setError,
      setGenerating,
      streamChat,
    ],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversation || !content.trim() || isGenerating) return;

      const userMsg = createMessage("user", content.trim());
      const assistantMsg = createMessage("assistant", "", "streaming");

      const working: Conversation = {
        ...conversation,
        title:
          conversation.messages.length === 0
            ? deriveTitle(content)
            : conversation.title,
        messages: [...conversation.messages, userMsg, assistantMsg],
        updatedAt: Date.now(),
      };

      await persist(working);
      await runAssistantStream(working, assistantMsg);
    },
    [conversation, isGenerating, persist, runAssistantStream],
  );

  const resendUserMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!conversation || !content.trim() || isGenerating) return;

      const index = conversation.messages.findIndex((m) => m.id === messageId);
      if (index < 0 || conversation.messages[index].role !== "user") return;

      const trimmed = content.trim();
      const assistantMsg = createMessage("assistant", "", "streaming");

      const working: Conversation = {
        ...conversation,
        messages: [
          ...conversation.messages.slice(0, index),
          {
            ...conversation.messages[index],
            content: trimmed,
            status: "done" as const,
          },
          assistantMsg,
        ],
        updatedAt: Date.now(),
      };

      await persist(working);
      await runAssistantStream(working, assistantMsg);
    },
    [conversation, isGenerating, persist, runAssistantStream],
  );

  const stopGeneration = useCallback(() => {
    const controller = useChatRuntimeStore.getState().abortController;
    controller?.abort();
    setGenerating(false);
    setAbortController(null);
    setError(null);

    if (conversation) {
      const updated: Conversation = {
        ...conversation,
        messages: conversation.messages.map((m) =>
          m.status === "streaming" ? { ...m, status: "stopped" } : m,
        ),
        updatedAt: Date.now(),
      };
      void persist(updated);
    }
  }, [conversation, persist, setGenerating, setAbortController]);

  return {
    conversation,
    isGenerating,
    error,
    sendMessage,
    resendUserMessage,
    stopGeneration,
  };
}
