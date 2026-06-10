import type { Conversation } from "@/types/domain";

export interface ConversationGroup {
  label: string;
  items: Conversation[];
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getDateLabel(timestamp: number): string {
  const now = new Date();
  const today = startOfDay(now.getTime());
  const yesterday = today - 86_400_000;
  const day = startOfDay(timestamp);

  if (day === today) return "今天";
  if (day === yesterday) return "昨天";

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  const currentYear = now.getFullYear();

  return currentYear === year
    ? `${month}月${dayOfMonth}日`
    : `${year}年${month}月${dayOfMonth}日`;
}

export function groupConversationsByDate(
  conversations: Conversation[],
): ConversationGroup[] {
  const map = new Map<string, Conversation[]>();

  for (const conv of conversations) {
    const label = getDateLabel(conv.updatedAt);
    const group = map.get(label);
    if (group) {
      group.push(conv);
    } else {
      map.set(label, [conv]);
    }
  }

  const order = ["今天", "昨天"];
  const groups: ConversationGroup[] = [];

  for (const label of order) {
    const items = map.get(label);
    if (items?.length) {
      groups.push({ label, items });
      map.delete(label);
    }
  }

  for (const [label, items] of map) {
    groups.push({ label, items });
  }

  return groups;
}
