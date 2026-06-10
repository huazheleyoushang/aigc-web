"use client";

import { useEffect } from "react";

interface DeleteConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConversationDialog({
  open,
  onClose,
  onConfirm,
}: DeleteConversationDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-conversation-title"
        className="w-full max-w-[420px] rounded-[28px] bg-white px-8 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h3
          id="delete-conversation-title"
          className="text-lg font-semibold text-[var(--text-primary)]"
        >
          删除后，该对话将不可恢复
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          由该对话生成的分享链接也将失效
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] bg-white px-5 py-2 text-sm text-[var(--text-primary)] transition hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-[#ef4444] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#dc2626]"
          >
            删除该对话
          </button>
        </div>
      </div>
    </div>
  );
}
