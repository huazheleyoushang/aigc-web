"use client";

import dynamic from "next/dynamic";
import { ChatPageSkeleton } from "@/features/chat/components/ChatPageSkeleton";

const ChatPage = dynamic(
  () => import("@/features/chat/components/ChatPage").then((m) => m.ChatPage),
  {
    loading: () => <ChatPageSkeleton />,
    ssr: false,
  },
);

export function ChatPageClient() {
  return <ChatPage />;
}
