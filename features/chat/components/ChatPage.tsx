"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChatInput } from "@/features/chat/components/ChatInput";
import { ConversationSidebar } from "@/features/chat/components/ConversationSidebar";
import { MessageList } from "@/features/chat/components/MessageList";
import { useChat } from "@/features/chat/hooks/useChat";
import { useAuthStore } from "@/stores/authStore";
import { useConversationStore } from "@/stores/conversationStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { User } from "@/types/domain";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { ChatPageSkeleton } from "@/features/chat/components/ChatPageSkeleton";
import { GlobalSearchModal } from "@/features/chat/components/GlobalSearchModal";

function ChatPageContent({ user }: { user: User }) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clear);
  const model = useSettingsStore((s) => s.model);
  const setModel = useSettingsStore((s) => s.setModel);
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useSettingsStore((s) => s.toggleSidebarCollapsed);
  const activeConversationId = useConversationStore(
    (s) => s.activeConversationId,
  );
  const initActive = useConversationStore((s) => s.initActive);
  const getOrCreateEmpty = useConversationStore((s) => s.getOrCreateEmpty);
  const setActiveConversationId = useConversationStore(
    (s) => s.setActiveConversationId,
  );
  const remove = useConversationStore((s) => s.remove);
  const conversations = useConversationStore((s) => s.conversations);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftKey, setDraftKey] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setEditingMessageId(null);
  }, [activeConversationId]);

  useEffect(() => {
    let active = true;
    initActive(user.id)
      .catch(() => undefined)
      .finally(() => {
        if (active) setInitializing(false);
      });
    return () => {
      active = false;
    };
  }, [user.id, initActive]);

  const {
    conversation,
    isGenerating,
    error,
    sendMessage,
    resendUserMessage,
    stopGeneration,
  } = useChat(activeConversationId ?? "", user.id);

  const handleNewChat = useCallback(async () => {
    try {
      const empty = await getOrCreateEmpty(user.id);
      setActiveConversationId(empty.id);
      setSidebarOpen(false);
    } catch {
      // ignore
    }
  }, [getOrCreateEmpty, setActiveConversationId, user.id]);

  const handleDelete = useCallback(
    async (id: string) => {
      const isActive = id === activeConversationId;
      await remove(user.id, id);
      if (isActive) {
        const empty = await getOrCreateEmpty(user.id);
        setActiveConversationId(empty.id);
      }
      setSidebarOpen(false);
    },
    [
      activeConversationId,
      remove,
      user.id,
      getOrCreateEmpty,
      setActiveConversationId,
    ],
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    router.replace("/login");
  };

  const handleSuggestion = (text: string) => {
    setDraft(text);
    setDraftKey((k) => k + 1);
  };

  const handleStartEdit = (messageId: string) => {
    if (isGenerating) return;
    setEditingMessageId(messageId);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  const handleResendEdit = (messageId: string, content: string) => {
    setEditingMessageId(null);
    void resendUserMessage(messageId, content);
  };

  if (initializing || !activeConversationId) {
    return <ChatPageSkeleton />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <ConversationSidebar
        user={user}
        onNewChat={() => void handleNewChat()}
        onDelete={(id) => void handleDelete(id)}
        onOpenSearch={() => setSearchOpen(true)}
        collapsible
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="关闭侧边栏"
            className="absolute inset-0 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-64 shadow-xl">
            <ConversationSidebar
              user={user}
              onNewChat={() => void handleNewChat()}
              onDelete={(id) => void handleDelete(id)}
              onOpenSearch={() => {
                setSidebarOpen(false);
                setSearchOpen(true);
              }}
            />
          </div>
        </div>
      )}

      <main className="relative flex min-w-0 flex-1 flex-col">
        <ChatHeader
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          conversationTitle={conversation?.title ?? "新对话"}
          model={model}
          onToggleSidebar={toggleSidebarCollapsed}
          onNewChat={() => void handleNewChat()}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileSidebar={() => setSidebarOpen(true)}
          onModelChange={setModel}
          onLogout={() => void handleLogout()}
        />

        <GlobalSearchModal
          open={searchOpen}
          conversations={conversations}
          onClose={() => setSearchOpen(false)}
          onSelect={(conversationId) => {
            setActiveConversationId(conversationId);
            setEditingMessageId(null);
          }}
        />

        {error && (
          <div className="shrink-0 bg-red-50 px-4 py-2 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <MessageList
          messages={conversation?.messages ?? []}
          onSelectSuggestion={handleSuggestion}
          editingMessageId={editingMessageId}
          isGenerating={isGenerating}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onResendEdit={handleResendEdit}
        />

        <div className="h-36 shrink-0" />

        <ChatInput
          disabled={isGenerating}
          isGenerating={isGenerating}
          onSend={(content) => {
            setDraft("");
            void sendMessage(content);
          }}
          onStop={stopGeneration}
          initialValue={draft}
          inputKey={draftKey}
        />
      </main>
    </div>
  );
}

export function ChatPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) {
    return <ChatPageSkeleton />;
  }

  return <ChatPageContent user={user} />;
}
