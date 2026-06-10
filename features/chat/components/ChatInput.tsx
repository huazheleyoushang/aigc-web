"use client";

import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
} from "react";
import { LINE_ICONS, LineIcon } from "@/components/LineIcon";

interface ChatInputProps {
  disabled?: boolean;
  isGenerating?: boolean;
  onSend: (content: string) => void;
  onStop?: () => void;
  initialValue?: string;
  inputKey?: number;
}

export function ChatInput({
  disabled,
  isGenerating,
  onSend,
  onStop,
  initialValue = "",
  inputKey = 0,
}: ChatInputProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
    textareaRef.current?.focus();
  }, [initialValue, inputKey]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating) return;
      handleSend();
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-6 pt-10">
      <div className="pointer-events-auto mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition focus-within:border-[var(--accent)] focus-within:shadow-[0_4px_24px_rgba(77,107,254,0.12)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="给 AIGC Chat 发送消息"
            rows={1}
            className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
          />
          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="停止生成"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:bg-gray-50"
            >
              <LineIcon name={LINE_ICONS.pause} size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              aria-label="发送消息"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LineIcon name={LINE_ICONS.send} size={16} />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          内容由 AI 生成，请仔细甄别
        </p>
      </div>
    </div>
  );
}
