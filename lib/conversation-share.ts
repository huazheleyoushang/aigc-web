import type { Conversation } from "@/types/domain";

export function formatConversationShareText(conversation: Conversation): string {
  const lines = [conversation.title, ""];

  for (const msg of conversation.messages) {
    if (msg.role === "user") {
      lines.push(`用户：${msg.content}`);
    } else if (msg.role === "assistant" && msg.content) {
      lines.push(`AI：${msg.content}`);
    }
  }

  return lines.join("\n\n");
}

export async function shareConversation(
  conversation: Conversation,
): Promise<{ ok: boolean; message: string }> {
  const text = formatConversationShareText(conversation);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: conversation.title, text });
      return { ok: true, message: "已分享" };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { ok: false, message: "已取消分享" };
      }
    }
  }

  const { copyToClipboard } = await import("@/lib/clipboard");
  const ok = await copyToClipboard(text);
  return ok
    ? { ok: true, message: "对话内容已复制到剪贴板" }
    : { ok: false, message: "分享失败，请重试" };
}
