"use client";

import { useState, type ReactNode } from "react";
import { copyToClipboard } from "@/lib/clipboard";

interface CodeBlockProps {
  children: ReactNode;
  codeText: string;
  className?: string;
}

export function CodeBlock({ children, codeText, className }: CodeBlockProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const language = className?.replace("language-", "") ?? "text";

  const handleCopy = async () => {
    const ok = await copyToClipboard(codeText);
    setStatus(ok ? "copied" : "failed");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const label =
    status === "copied" ? "已复制" : status === "failed" ? "复制失败" : "复制";

  return (
    <div className="code-block md-block-full my-3 box-border w-full min-w-0">
      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-[var(--border)] bg-[var(--code-bg)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
        <span>{language}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={`rounded px-2 py-0.5 hover:bg-white hover:text-[var(--text-primary)] hover:cursor-pointer ${
            status === "failed" ? "text-red-500" : ""
          }`}
        >
          {label}
        </button>
      </div>
      <pre className="hljs md-block-full m-0 box-border w-full min-w-0 overflow-x-auto rounded-b-xl border border-[var(--border)] bg-[var(--code-bg)] p-4 text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
