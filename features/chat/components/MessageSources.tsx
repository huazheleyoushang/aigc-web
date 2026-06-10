"use client";

import { useState } from "react";
import {
  extractSourcesFromMarkdown,
  getFaviconUrl,
  type MessageSource,
} from "@/lib/extract-sources";

interface MessageSourcesProps {
  content: string;
}

function FaviconStack({ sources }: { sources: MessageSource[] }) {
  const visible = sources.slice(0, 4);
  return (
    <span className="flex items-center -space-x-1.5">
      {visible.map((source) => (
        <img
          key={source.url}
          src={getFaviconUrl(source.domain)}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] rounded-full border border-white bg-white"
        />
      ))}
    </span>
  );
}

export function MessageSources({ content }: MessageSourcesProps) {
  const sources = extractSourcesFromMarkdown(content);
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-4 w-full">
      <p className="mb-2 text-xs text-[var(--text-muted)]">信息来源</p>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--text-primary)] shadow-sm transition hover:bg-gray-50"
      >
        <FaviconStack sources={sources} />
        <span>{sources.length} 个网页</span>
      </button>

      {expanded && (
        <ul className="mt-2 w-full space-y-1 rounded-xl border border-[var(--border)] bg-white p-2">
          {sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-gray-50 hover:text-[var(--accent)]"
              >
                <img
                  src={getFaviconUrl(source.domain)}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 shrink-0 rounded-full"
                />
                <span className="truncate">{source.title}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
