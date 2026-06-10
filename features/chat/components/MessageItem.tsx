"use client";

import { MarkdownContent } from "@/features/chat/components/MarkdownContent";
import { MessageActions } from "@/features/chat/components/MessageActions";
import { MessageSources } from "@/features/chat/components/MessageSources";
import { ThinkingBlock } from "@/features/chat/components/ThinkingBlock";
import { UserMessageActions } from "@/features/chat/components/UserMessageActions";
import { UserMessageEdit } from "@/features/chat/components/UserMessageEdit";
import type { Message } from "@/types/domain";

interface MessageItemProps {
  message: Message;
  editingMessageId?: string | null;
  isGenerating?: boolean;
  onStartEdit?: (messageId: string) => void;
  onCancelEdit?: () => void;
  onResendEdit?: (messageId: string, content: string) => void;
}

export function MessageItem({
  message,
  editingMessageId,
  isGenerating,
  onStartEdit,
  onCancelEdit,
  onResendEdit,
}: MessageItemProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const isDone = message.status === "done";
  const isEditing = isUser && editingMessageId === message.id;

  if (isUser) {
    return (
      <div className="group flex w-full flex-col items-end">
        {isEditing ? (
          <UserMessageEdit
            initialContent={message.content}
            disabled={isGenerating}
            onCancel={() => onCancelEdit?.()}
            onSend={(content) => onResendEdit?.(message.id, content)}
          />
        ) : (
          <>
            <div className="max-w-[min(720px,85%)] rounded-2xl rounded-br-md bg-[var(--user-bubble)] px-4 py-3 text-[15px] text-[var(--text-primary)]">
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            <UserMessageActions
              content={message.content}
              onEdit={() => onStartEdit?.(message.id)}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full">
      <div className="message-content min-w-0 w-full flex-1">
        <ThinkingBlock
          reasoning={message.reasoning}
          isThinking={isStreaming && !message.content}
        />
        <MarkdownContent content={message.content} streaming={isStreaming} />
        {message.status === "error" && (
          <p className="mt-2 text-sm text-red-500">生成失败，请重试</p>
        )}
        {message.status === "stopped" && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">已停止生成</p>
        )}
        {isDone && message.content && (
          <>
            <MessageSources content={message.content} />
            <MessageActions message={message} />
          </>
        )}
      </div>
    </div>
  );
}
