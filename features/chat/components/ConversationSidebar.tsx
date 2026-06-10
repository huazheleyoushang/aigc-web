"use client";

import { useEffect, useRef, useState } from "react";
import { LINE_ICONS, LineIcon } from "@/components/LineIcon";
import { BrandLogo } from "@/features/chat/components/BrandLogo";
import { ConversationItemMenu } from "@/features/chat/components/ConversationItemMenu";
import { DeleteConversationDialog } from "@/features/chat/components/DeleteConversationDialog";
import { RenameDialog } from "@/features/chat/components/RenameDialog";
import { SearchIconButton } from "@/features/chat/components/SidebarIconButtons";
import { SidebarToggleButton } from "@/features/chat/components/SidebarToggleButton";
import { shareConversation } from "@/lib/conversation-share";
import { groupConversationsByDate } from "@/lib/group-conversations";
import {
  selectHistoryConversations,
  useConversationStore,
} from "@/stores/conversationStore";
import type { Conversation, User } from "@/types/domain";

const SIDEBAR_WIDTH = "w-[260px]";

interface ConversationSidebarProps {
  user: User;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onOpenSearch?: () => void;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ConversationSidebar({
  user,
  onNewChat,
  onDelete,
  onOpenSearch,
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
}: ConversationSidebarProps) {
  const conversations = useConversationStore((s) => s.conversations);
  const activeConversationId = useConversationStore(
    (s) => s.activeConversationId,
  );
  const setActiveConversationId = useConversationStore(
    (s) => s.setActiveConversationId,
  );
  const rename = useConversationStore((s) => s.rename);
  const togglePin = useConversationStore((s) => s.togglePin);
  const loaded = useConversationStore((s) => s.loaded);
  const load = useConversationStore((s) => s.load);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const menuAnchorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!loaded) {
      void load(user.id);
    }
  }, [user.id, loaded, load]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const history = selectHistoryConversations(conversations);
  const groupedHistory = groupConversationsByDate(history);

  const showToast = (message: string) => setToast(message);

  const handleShare = async (conv: Conversation) => {
    const result = await shareConversation(conv);
    if (result.message) showToast(result.message);
  };

  const handleRenameConfirm = async (title: string) => {
    if (!renameTarget) return;
    await rename(user.id, renameTarget.id, title);
    setRenameTarget(null);
    showToast("重命名成功");
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    onDelete(deleteTarget.id);
    setDeleteTarget(null);
    setOpenMenuId(null);
  };

  const openMenuConversation = openMenuId
    ? history.find((conv) => conv.id === openMenuId)
    : undefined;

  return (
    <>
      <aside
        className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-white transition-[width] duration-200 ease-in-out ${
          collapsible
            ? `hidden md:flex ${collapsed ? "w-0 border-r-0" : SIDEBAR_WIDTH}`
            : SIDEBAR_WIDTH
        }`}
      >
        <div
          className={`flex min-w-[260px] flex-col ${
            collapsed && collapsible ? "invisible" : "visible"
          }`}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <BrandLogo />
            <div className="flex items-center gap-0.5">
              <SearchIconButton onClick={onOpenSearch} />
              {onToggleCollapse && (
                <SidebarToggleButton
                  collapsed={collapsed}
                  onClick={onToggleCollapse}
                />
              )}
            </div>
          </div>

          <div className="px-3 pb-4">
            <button
              type="button"
              onClick={onNewChat}
              className="flex w-full items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:bg-gray-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)]">
                <LineIcon name={LINE_ICONS.plus} size={12} />
              </span>
              开启新对话
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {groupedHistory.length === 0 ? (
              <p className="px-2 text-sm text-[var(--text-muted)]">
                暂无历史记录
              </p>
            ) : (
              groupedHistory.map((group) => (
                <div key={group.label} className="mb-3">
                  <p className="px-3 pb-1.5 text-xs text-[var(--text-muted)]">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((conv) => {
                      const isActive = conv.id === activeConversationId;
                      const menuOpen = openMenuId === conv.id;

                      return (
                        <li key={conv.id} className="group relative">
                          <button
                            type="button"
                            onClick={() => setActiveConversationId(conv.id)}
                            className={`flex w-full items-center gap-1 truncate rounded-xl py-2.5 pl-3 pr-9 text-left text-sm transition ${
                              isActive
                                ? "bg-[var(--user-bubble)] font-medium text-[var(--accent)]"
                                : "text-[var(--text-secondary)] hover:bg-gray-50"
                            }`}
                          >
                            {conv.pinned && (
                              <LineIcon
                                name={LINE_ICONS.pin}
                                size={12}
                                className="shrink-0 text-[var(--accent)]"
                                aria-label="已置顶"
                              />
                            )}
                            <span className="truncate">{conv.title}</span>
                          </button>

                          <div className="absolute right-1 top-1/2 -translate-y-1/2">
                            <button
                              ref={menuOpen ? menuAnchorRef : undefined}
                              type="button"
                              aria-label="更多操作"
                              aria-expanded={menuOpen}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(menuOpen ? null : conv.id);
                              }}
                              className={`flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-white/80 hover:text-[var(--text-primary)] ${
                                menuOpen || isActive
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <LineIcon name={LINE_ICONS.more} size={14} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>

          {toast && (
            <div className="mx-3 mb-3 rounded-lg bg-[var(--text-primary)] px-3 py-2 text-center text-xs text-white">
              {toast}
            </div>
          )}
        </div>
      </aside>

      {openMenuConversation && (
        <ConversationItemMenu
          open
          anchorRef={menuAnchorRef}
          pinned={openMenuConversation.pinned}
          onClose={() => setOpenMenuId(null)}
          onRename={() => setRenameTarget(openMenuConversation)}
          onTogglePin={() =>
            void togglePin(user.id, openMenuConversation.id)
          }
          onShare={() => void handleShare(openMenuConversation)}
          onDelete={() => {
            setOpenMenuId(null);
            setDeleteTarget(openMenuConversation);
          }}
        />
      )}

      <DeleteConversationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <RenameDialog
        open={Boolean(renameTarget)}
        title={renameTarget?.title ?? ""}
        onClose={() => setRenameTarget(null)}
        onConfirm={(title) => void handleRenameConfirm(title)}
      />
    </>
  );
}
