"use client";

import { useEffect } from "react";
import { MessageItem } from "@/features/chat/components/MessageItem";
import { useAutoScroll } from "@/features/chat/hooks/useAutoScroll";
import type { Message } from "@/types/domain";

interface MessageListProps {
  messages: Message[];
  onSelectSuggestion?: (text: string) => void;
  editingMessageId?: string | null;
  isGenerating?: boolean;
  onStartEdit?: (messageId: string) => void;
  onCancelEdit?: () => void;
  onResendEdit?: (messageId: string, content: string) => void;
}

const SUGGESTIONS = [
  "用简单的话解释量子计算",
  "帮我写一封求职邮件",
  "用 Python 实现快速排序",
];

export function MessageList({
  messages,
  onSelectSuggestion,
  editingMessageId,
  isGenerating,
  onStartEdit,
  onCancelEdit,
  onResendEdit,
}: MessageListProps) {
  const { ref, scrollToBottom } = useAutoScroll<HTMLDivElement>();

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8 px-4 text-center">
        
        {/* Welcome text */}
        <h1 className="text-xl font-medium text-[var(--text-primary)]">
          今天有什么计划？
        </h1>

        {/* Quick actions */}
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => onSelectSuggestion?.(text)}
              className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--text-secondary)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)] hover:cursor-pointer"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            editingMessageId={editingMessageId}
            isGenerating={isGenerating}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onResendEdit={onResendEdit}
          />
        ))}
      </div>
    </div>
  );
}
