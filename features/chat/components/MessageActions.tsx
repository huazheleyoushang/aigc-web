"use client";

import { useState } from "react";
import { LINE_ICONS, LineIcon } from "@/components/LineIcon";
import { copyToClipboard } from "@/lib/clipboard";
import { shareConversation } from "@/lib/conversation-share";
import type { Message } from "@/types/domain";

interface MessageActionsProps {
  message: Message;
}

function IconButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: (typeof LINE_ICONS)[keyof typeof LINE_ICONS];
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-gray-100 hover:text-[var(--text-primary)]"
    >
      <LineIcon name={icon} size={16} />
    </button>
  );
}

export function MessageActions({ message }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(message.content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    await shareConversation({
      id: message.id,
      userId: "",
      title: "对话摘录",
      model: "",
      messages: [message],
      createdAt: message.createdAt,
      updatedAt: message.createdAt,
    });
  };

  return (
    <div className="mt-2 flex items-center gap-0.5">
      <IconButton
        label={copied ? "已复制" : "复制"}
        icon={LINE_ICONS.clipboard}
        onClick={() => void handleCopy()}
      />
      <IconButton
        label="重新生成"
        icon={LINE_ICONS.refresh}
        onClick={() => {}}
      />
      <IconButton
        label="点赞"
        icon={LINE_ICONS.thumbsUp}
        onClick={() => {}}
      />
      <IconButton
        label="点踩"
        icon={LINE_ICONS.thumbsDown}
        onClick={() => {}}
      />
      <IconButton
        label="分享"
        icon={LINE_ICONS.share}
        onClick={() => void handleShare()}
      />
    </div>
  );
}
