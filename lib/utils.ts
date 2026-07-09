import { v4 as uuidv4 } from "uuid";
import type { Conversation, Message } from "@/types/domain";
import { getDefaultModel } from "@/config/models";

export function createId(): string {
  return uuidv4();
}

export function createMessage(
  role: Message["role"],
  content: string,
  status: Message["status"] = "done",
): Message {
  return {
    id: createId(),
    role,
    content,
    status,
    createdAt: Date.now(),
  };
}

export function createConversation(userId: string): Conversation {
  const now = Date.now();
  return {
    id: createId(),
    userId,
    title: "新对话",
    model: getDefaultModel().id,
    messages: [],
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function deriveTitle(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "新对话";

  // 去掉常见问候语和前缀：你好、Hi、hello、请问、帮我、给我、写一个等
  const greetings = /^(你好|您好|hi|hello|hey|嗨|哈喽|早上好|晚上好|下午好|中午好)[,，.!?；;]*\s*/i;
  let title = trimmed.replace(greetings, "");

  // 去掉"请问"、"能不能"、"可以"等前缀
  const prefixes = /^(请问|能|能不能|可以|能否|帮忙|帮|给我|为我|帮我|替我)[,，.!?；;：:]*\s*/;
  title = title.replace(prefixes, "");

  // 去掉首尾引号、括号
  title = title.replace(/^[""「『（(【\[{|]+/, "").replace(/[""」』)）】\]|}]+$/, "");

  // 如果处理后为空，返回原始内容的前20字符
  if (!title.trim()) {
    return trimmed.length > 20 ? `${trimmed.slice(0, 20)}…` : trimmed;
  }

  // 截断到合理长度（最多30字符）
  if (title.length > 30) {
    // 尽量在标点处截断
    const lastPunct = title.search(/[。！？；;,.!?;]$/);
    if (lastPunct > 15) {
      title = title.slice(0, lastPunct + 1);
    } else {
      title = `${title.slice(0, 28)}…`;
    }
  }

  // 首字大写（中文不需要，但保留一致性）
  return title.trim();
}

export function isEmptyConversation(conversation: Conversation): boolean {
  return conversation.messages.length === 0;
}

export function isHistoryConversation(conversation: Conversation): boolean {
  return conversation.messages.length > 0;
}
