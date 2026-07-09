"use client";

import { useEffect, useRef, useState } from "react";
import { LINE_ICONS, LineIcon } from "@/components/LineIcon";
import { BrandLogo } from "@/features/chat/components/BrandLogo";
import { ConversationItemMenu } from "@/features/chat/components/ConversationItemMenu";
import { DeleteConversationDialog } from "@/features/chat/components/DeleteConversationDialog";
import { RenameDialog } from "@/features/chat/components/RenameDialog";
import { shareConversation } from "@/lib/conversation-share";
import { groupConversationsByDate } from "@/lib/group-conversations";
import { isHistoryConversation } from "@/lib/utils";
import {
  selectHistoryConversations,
  useConversationStore,
} from "@/stores/conversationStore";
import type { Conversation, User } from "@/types/domain";
import { useAuthStore } from "@/stores/authStore";
import { useGuestStore, GUEST_USER_ID } from "@/stores/guestStore";

const SIDEBAR_WIDTH = "w-[260px]";

interface NavItem {
  id: string;
  label: string;
  icon: (typeof LINE_ICONS)[keyof typeof LINE_ICONS];
}

const NAV_ITEMS: NavItem[] = [
  { id: "new-chat", label: "新聊天", icon: LINE_ICONS.commentPlus },
  { id: "search", label: "搜索聊天", icon: LINE_ICONS.search },
  { id: "files", label: "文件库", icon: LINE_ICONS.folder },
  { id: "projects", label: "项目", icon: LINE_ICONS.briefcase },
  { id: "apps", label: "应用", icon: LINE_ICONS.grid },
  { id: "codex", label: "Codex", icon: LINE_ICONS.code },
];

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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const menuAnchorRef = useRef<HTMLButtonElement>(null);

  const authUser = useAuthStore((s) => s.user);
  const isGuest = useGuestStore((s) => s.isGuest);

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

  // 所有对话（含空对话），置顶优先
  const allConvs = conversations
    .filter((c) => c.userId === user.id)
    .sort((a, b) => {
      const aPinned = a.pinned ? 1 : 0;
      const bPinned = b.pinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return b.updatedAt - a.updatedAt;
    });
  // 对话记录：只显示已有消息的会话（过滤掉"新对话"）
  const historyConvs = allConvs.filter(isHistoryConversation);
  const groupedHistory = groupConversationsByDate(historyConvs);

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
    ? allConvs.find((conv) => conv.id === openMenuId)
    : undefined;

  // 用户名显示：优先用真实用户，否则游客
  const displayInitial = (authUser?.username ?? "游")?.charAt(0).toUpperCase();

  return (
    <>
      <aside
        className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-[#f9fafb] transition-[width] duration-200 ease-in-out ${
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
          {/* 顶部：小 logo */}
          <div className="flex items-center justify-between px-4 py-4">
            <BrandLogo size="sm" />
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
                className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-gray-200 hover:cursor-pointer transition"
              >
                <LineIcon
                  name={collapsed ? LINE_ICONS.layout : LINE_ICONS.menu}
                  size={16}
                />
              </button>
            )}
          </div>

          {/* 导航列表 */}
          <nav className="flex-1 overflow-y-auto px-2">
            <ul className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.id === "new-chat") {
                        onNewChat();
                      } else if (item.id === "search") {
                        onOpenSearch?.();
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl py-2.5 pl-3 pr-4 text-sm transition hover:cursor-pointer ${
                      item.id === "new-chat"
                        ? "bg-white font-medium text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <LineIcon
                      name={item.icon}
                      size={18}
                      className="shrink-0"
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* 对话记录分组列表 */}
            {groupedHistory.length > 0 && (
              <>
                <div className="mt-4 mb-1 px-3 text-[11px] font-medium text-[var(--text-tertiary)]">
                  对话记录
                </div>
                <ul className="space-y-0.5">
                  {groupedHistory.map((group) => (
                    <li key={group.label} className="px-1">
                      <div className="py-1 text-[11px] font-medium text-[var(--text-tertiary)]">
                        {group.label}
                      </div>
                      <ul className="space-y-0.5">
                        {group.items.map((conv) => {
                          const isActive = conv.id === activeConversationId;
                          const isMenuOpen = openMenuId === conv.id;
                          return (
                            <li key={conv.id} className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveConversationId(conv.id)
                                }
                                title={conv.title}
                                className={`group flex w-full items-center gap-2 rounded-xl py-2.5 pl-3 pr-2 text-left text-sm transition hover:cursor-pointer ${
                                  isActive
                                    ? "bg-white font-medium text-[var(--text-primary)] shadow-sm"
                                    : "text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--text-primary)]"
                                }`}
                              >
                                {conv.pinned && (
                                  <LineIcon
                                    name={LINE_ICONS.pin}
                                    size={12}
                                    className="shrink-0 text-[var(--text-tertiary)]"
                                  />
                                )}
                                <span className="min-w-0 flex-1 truncate">
                                  {conv.title}
                                </span>
                                {/* 操作按钮：hover 时显示 */}
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    if (isGuest) return; // 游客不显示菜单
                                    e.stopPropagation();
                                    setOpenMenuId(
                                      isMenuOpen ? null : conv.id,
                                    );
                                    setMenuAnchor(e.currentTarget);
                                  }}
                                  onKeyDown={(e) => {
                                    if (isGuest) return;
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      setOpenMenuId(
                                        isMenuOpen ? null : conv.id,
                                      );
                                      setMenuAnchor(e.currentTarget);
                                    }
                                  }}
                                  aria-label="操作"
                                  className={`shrink-0 cursor-pointer rounded p-0.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 ${
                                    isGuest
                                      ? "pointer-events-none"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  <LineIcon
                                    name={LINE_ICONS.more}
                                    size={14}
                                  />
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>

          {/* Toast 提示 */}
          {toast && (
            <div className="mx-3 mb-3 rounded-lg bg-[var(--text-primary)] px-3 py-2 text-center text-xs text-white">
              {toast}
            </div>
          )}
          {/* 底部：用户信息 */}
          <div className="mt-3 border-t border-[var(--border)] px-3 py-2">
            {authUser ? (
              <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--text-secondary)] hover:cursor-pointer hover:bg-gray-100 transition">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-medium text-white">
                  {displayInitial}
                </div>
                <span className="truncate">{authUser.username}</span>
              </div>
            ) : (
              <div className="rounded-lg px-2 py-1.5 text-sm text-[var(--text-tertiary)]">
                未登录
              </div>
            )}
          </div>
        </div>
      </aside>

      {openMenuConversation && menuAnchor && !isGuest && (
        <ConversationItemMenu
          open
          anchorRef={{ current: menuAnchor }}
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

      {!isGuest && (
        <>
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
      )}
    </>
  );
}
