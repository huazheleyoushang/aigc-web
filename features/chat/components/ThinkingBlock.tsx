"use client";

import { useState } from "react";

interface ThinkingBlockProps {
  reasoning?: string;
  isThinking: boolean;
}

export function ThinkingBlock({ reasoning, isThinking }: ThinkingBlockProps) {
  const [open, setOpen] = useState(false);
  const hasContent = Boolean(reasoning?.trim());

  if (!isThinking && !hasContent) return null;

  return (
    <div className="mb-3 rounded-xl border border-[var(--border)] bg-[var(--bg-sidebar)]">
      <button
        type="button"
        onClick={() => hasContent && setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[var(--text-secondary)]"
      >
        <span className="flex items-center gap-2">
          <span>{isThinking ? "思考中" : "思考过程"}</span>
          {isThinking && (
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" />
            </span>
          )}
        </span>
        {hasContent && (
          <span className="text-xs text-[var(--text-muted)]">
            {open ? "收起" : "展开"}
          </span>
        )}
      </button>
      {hasContent && open && (
        <div className="border-t border-[var(--border)] px-3 py-2 text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
          {reasoning}
        </div>
      )}
    </div>
  );
}
