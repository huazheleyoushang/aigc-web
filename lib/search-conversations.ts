import type { Conversation } from "@/types/domain";

export interface SearchResult {
  conversationId: string;
  title: string;
  snippet: string;
  updatedAt: number;
  score: number;
}

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function fuzzyScore(text: string, query: string): number {
  const source = normalize(text);
  const keyword = normalize(query);
  if (!keyword) return 0;

  const directIndex = source.indexOf(keyword);
  if (directIndex >= 0) {
    return 1000 - directIndex;
  }

  let qi = 0;
  for (let i = 0; i < source.length && qi < keyword.length; i += 1) {
    if (source[i] === keyword[qi]) qi += 1;
  }

  if (qi === keyword.length) {
    return 400 - Math.min(source.length, 200);
  }

  return 0;
}

function extractSnippet(content: string, query: string, maxLen = 72): string {
  const trimmed = content.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";

  const keyword = normalize(query);
  const lower = trimmed.toLowerCase();
  const index = keyword ? lower.indexOf(keyword) : -1;

  if (index < 0) {
    return trimmed.length > maxLen ? `${trimmed.slice(0, maxLen)}…` : trimmed;
  }

  const start = Math.max(0, index - 18);
  const end = Math.min(trimmed.length, start + maxLen);
  let snippet = trimmed.slice(start, end);

  if (start > 0) snippet = `…${snippet}`;
  if (end < trimmed.length) snippet = `${snippet}…`;

  return snippet;
}

function getLatestMessageContent(conversation: Conversation): string {
  for (let i = conversation.messages.length - 1; i >= 0; i -= 1) {
    const message = conversation.messages[i];
    if (message.content.trim()) {
      return message.content;
    }
  }
  return "";
}

export function searchConversations(
  conversations: Conversation[],
  query: string,
): SearchResult[] {
  const keyword = query.trim();
  if (!keyword) return [];

  const results: SearchResult[] = [];

  for (const conversation of conversations) {
    if (conversation.messages.length === 0) continue;

    const titleScore = fuzzyScore(conversation.title, keyword);
    let bestScore = titleScore;
    let snippet = extractSnippet(conversation.title, keyword);

    for (const message of conversation.messages) {
      if (!message.content.trim()) continue;

      const contentScore = fuzzyScore(message.content, keyword);
      if (contentScore > bestScore) {
        bestScore = contentScore;
        snippet = extractSnippet(message.content, keyword);
      }
    }

    if (bestScore <= 0) continue;

    const latestContent = getLatestMessageContent(conversation);
    if (!snippet && latestContent) {
      snippet = extractSnippet(latestContent, keyword);
    }

    results.push({
      conversationId: conversation.id,
      title: conversation.title,
      snippet: snippet || latestContent.slice(0, 72),
      updatedAt: conversation.updatedAt,
      score: bestScore,
    });
  }

  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.updatedAt - a.updatedAt;
  });
}
