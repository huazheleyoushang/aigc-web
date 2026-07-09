"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

interface UserMessageEditProps {
  initialContent: string;
  disabled?: boolean;
  onCancel: () => void;
  onSend: (content: string) => void;
}

export function UserMessageEdit({
  initialContent,
  disabled,
  onCancel,
  onSend,
}: UserMessageEditProps) {
  const [value, setValue] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--accent)] bg-white p-4 shadow-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-[var(--text-primary)] focus:outline-none disabled:opacity-50"
      />
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="rounded-full border border-[var(--border)] bg-white px-5 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="rounded-full bg-[var(--accent)] px-5 py-1.5 text-sm text-white transition hover:bg-[var(--accent-hover)] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          发送
        </button>
      </div>
    </div>
  );
}
