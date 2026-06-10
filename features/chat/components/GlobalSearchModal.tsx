"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LINE_ICONS, LineIcon } from "@/components/LineIcon";
import { HighlightText } from "@/features/chat/components/HighlightText";
import { formatSearchTime } from "@/lib/format-search-time";
import { searchConversations } from "@/lib/search-conversations";
import type { Conversation } from "@/types/domain";

interface GlobalSearchModalProps {
  open: boolean;
  conversations: Conversation[];
  onClose: () => void;
  onSelect: (conversationId: string) => void;
}

export function GlobalSearchModal({
  open,
  conversations,
  onClose,
  onSelect,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => searchConversations(conversations, query),
    [conversations, query],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (results.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % results.length);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + results.length) % results.length);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const target = results[activeIndex];
        if (target) {
          onSelect(target.conversationId);
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, results, activeIndex, onClose, onSelect]);

  if (!open) return null;

  const handleSelect = (conversationId: string) => {
    onSelect(conversationId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="关闭搜索"
        className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <LineIcon
            name={LINE_ICONS.search}
            size={18}
            className="text-[var(--text-muted)]"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索对话"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-gray-100 hover:text-[var(--text-primary)]"
          >
            <LineIcon name={LINE_ICONS.close} size={16} />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto py-2">
          {!query.trim() ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              输入关键词，搜索历史对话标题和消息内容
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              未找到相关对话
            </p>
          ) : (
            <ul>
              {results.map((result, index) => {
                const isActive = index === activeIndex;

                return (
                  <li key={result.conversationId}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelect(result.conversationId)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                        isActive ? "bg-gray-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--user-bubble)] text-[var(--accent)]">
                        <LineIcon name={LINE_ICONS.comment} size={16} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                          <HighlightText text={result.title} query={query} />
                        </span>
                        <span className="mt-1 block line-clamp-2 text-sm text-[var(--text-secondary)]">
                          <HighlightText text={result.snippet} query={query} />
                        </span>
                      </span>

                      <span className="shrink-0 pt-0.5 text-xs text-[var(--text-muted)]">
                        {formatSearchTime(result.updatedAt)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
