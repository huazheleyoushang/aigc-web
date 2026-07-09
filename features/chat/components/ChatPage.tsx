"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInput } from "@/features/chat/components/ChatInput";
import { ConversationSidebar } from "@/features/chat/components/ConversationSidebar";
import { MessageList } from "@/features/chat/components/MessageList";
import { useChat } from "@/features/chat/hooks/useChat";
import { useAuthStore } from "@/stores/authStore";
import { useGuestStore, GUEST_USER_ID } from "@/stores/guestStore";
import { useConversationStore } from "@/stores/conversationStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { User } from "@/types/domain";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { ChatPageSkeleton } from "@/features/chat/components/ChatPageSkeleton";
import { GlobalSearchModal } from "@/features/chat/components/GlobalSearchModal";
import { LoginModal } from "@/features/auth/components/LoginModal";

function ChatPageContent({ user }: { user: User | null }) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clear);
  const isGuest = useGuestStore((s) => s.isGuest);
  const exitGuest = useGuestStore((s) => s.exitGuest);
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
  const [loginOpen, setLoginOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftKey, setDraftKey] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // 游客模式使用固定 userId，登录后切换到真实用户
  const effectiveUserId = user?.id ?? GUEST_USER_ID;

  useEffect(() => {
    setEditingMessageId(null);
  }, [activeConversationId]);

  useEffect(() => {
    let active = true;
    initActive(effectiveUserId)
      .catch(() => undefined)
      .finally(() => {
        if (active) setInitializing(false);
      });
    return () => {
      active = false;
    };
  }, [effectiveUserId, initActive]);

  const {
    conversation,
    isGenerating,
    error,
    sendMessage,
    resendUserMessage,
    stopGeneration,
  } = useChat(activeConversationId ?? "", effectiveUserId);

  const handleNewChat = useCallback(async () => {
    try {
      const empty = await getOrCreateEmpty(effectiveUserId);
      setActiveConversationId(empty.id);
      setSidebarOpen(false);
    } catch {
      // ignore
    }
  }, [getOrCreateEmpty, setActiveConversationId, effectiveUserId]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!user) return; // 游客不能删除
      const isActive = id === activeConversationId;
      await remove(user.id, id);
      if (isActive) {
        const empty = await getOrCreateEmpty(effectiveUserId);
        setActiveConversationId(empty.id);
      }
      setSidebarOpen(false);
    },
    [
      activeConversationId,
      remove,
      user,
      effectiveUserId,
      getOrCreateEmpty,
      setActiveConversationId,
    ],
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    exitGuest();
    router.replace("/");
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

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    // 游客登录后，切换到真实用户
    const newUser = useAuthStore.getState().user;
    if (newUser) {
      exitGuest();
    }
  };

  if (initializing || !activeConversationId) {
    return <ChatPageSkeleton />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <ConversationSidebar
        user={{ id: effectiveUserId, username: user?.username ?? "游客", createdAt: Date.now() }}
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
              user={{ id: effectiveUserId, username: user?.username ?? "游客", createdAt: Date.now() }}
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
          user={{ id: effectiveUserId, username: user?.username ?? "游客", createdAt: Date.now() }}
          isLoggedIn={Boolean(user)}
          sidebarCollapsed={sidebarCollapsed}
          conversationTitle={conversation?.title ?? "新对话"}
          model={model}
          onToggleSidebar={toggleSidebarCollapsed}
          onNewChat={() => void handleNewChat()}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileSidebar={() => setSidebarOpen(true)}
          onModelChange={setModel}
          onLogout={handleLogout}
          onLogin={() => setLoginOpen(true)}
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

        <div className="h-24 shrink-0" />

        <ChatInput
          disabled={isGenerating}
          isGenerating={isGenerating}
          onSend={(content) => {
            setDraft("");
            void sendMessage(content);
          }}
          initialValue={draft}
          inputKey={draftKey}
        />
      </main>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export function ChatPage() {
  const user = useAuthStore((s) => s.user);
  return <ChatPageContent user={user} />;
}
