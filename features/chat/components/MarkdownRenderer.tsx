"use client";

import "highlight.js/styles/github.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "@/features/chat/components/CodeBlock";
import { extractText } from "@/lib/extract-text";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-chat w-full max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          hr() {
            return null;
          },
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children, ...props }) {
            const isBlock = /language-(\w+)/.test(className ?? "");
            if (isBlock) {
              const codeText = extractText(children);
              return (
                <CodeBlock className={className} codeText={codeText}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </CodeBlock>
              );
            }
            return (
              <code
                className="inline-code rounded bg-[var(--code-bg)] px-1.5 py-0.5 text-[0.9em] text-[#0550ae]"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="markdown-table-wrapper md-block-full my-3 box-border w-full min-w-0 overflow-x-auto">
                <table className="markdown-table">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="markdown-table-head">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody>{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="markdown-table-row">{children}</tr>;
          },
          th({ children }) {
            return <th className="markdown-table-cell markdown-table-th">{children}</th>;
          },
          td({ children }) {
            return <td className="markdown-table-cell">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
