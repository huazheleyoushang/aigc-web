"use client";

import MarkdownRenderer from "@/features/chat/components/MarkdownRenderer";
import { prepareStreamingMarkdown } from "@/lib/prepare-streaming-markdown";

interface MarkdownContentProps {
  content: string;
  streaming?: boolean;
}

export function MarkdownContent({ content, streaming }: MarkdownContentProps) {
  if (!content) return null;

  const rendered = streaming ? prepareStreamingMarkdown(content) : content;

  return <MarkdownRenderer content={rendered} />;
}
