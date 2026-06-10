"use client";

import { useEffect, useRef } from "react";

interface RenameDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (title: string) => void;
}

export function RenameDialog({
  open,
  title,
  onClose,
  onConfirm,
}: RenameDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim() ?? "";
    if (value) onConfirm(value);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          重命名对话
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            ref={inputRef}
            type="text"
            defaultValue={title}
            maxLength={50}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            placeholder="输入对话标题"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
