import { localStorageConversationRepository } from "@/lib/repositories/local-storage";
import type { ConversationRepository } from "@/lib/repositories/types";

export function getConversationRepository(): ConversationRepository {
  return localStorageConversationRepository;
}
