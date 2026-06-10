import type { Conversation } from "@/types/domain";

export interface ConversationRepository {
  list(userId: string): Promise<Conversation[]>;
  get(id: string): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<void>;
  delete(id: string): Promise<void>;
}
