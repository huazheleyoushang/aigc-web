"use client";

import { useState } from "react";
import { LINE_ICONS, LineIcon } from "@/components/LineIcon";
import { copyToClipboard } from "@/lib/clipboard";

interface UserMessageActionsProps {
  content: string;
  onEdit: () => void;
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-gray-100 hover:text-[var(--text-primary)] hover:cursor-pointer"
    >
      {children}
    </button>
  );
}

export function UserMessageActions({ content, onEdit }: UserMessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-1 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 max-md:opacity-100">
      <IconButton label={copied ? "已复制" : "复制"} onClick={() => void handleCopy()}>
        <LineIcon name={LINE_ICONS.clipboard} size={15} />
      </IconButton>
      <IconButton label="编辑" onClick={onEdit}>
        <LineIcon name={LINE_ICONS.pencil} size={15} />
      </IconButton>
    </div>
  );
}
