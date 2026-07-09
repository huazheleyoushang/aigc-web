"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LINE_ICONS, LineIcon } from "@/components/LineIcon";
import { BrandLogo } from "@/features/chat/components/BrandLogo";
import { CompactSidebarToolbar } from "@/features/chat/components/CompactSidebarToolbar";
import { MODELS } from "@/config/models";
import type { User } from "@/types/domain";

interface ChatHeaderProps {
  user: User;
  isLoggedIn: boolean;
  sidebarCollapsed: boolean;
  conversationTitle: string;
  model: string;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
  onOpenMobileSidebar: () => void;
  onModelChange: (model: string) => void;
  onLogout: () => void;
  onLogin: () => void;
}

export function ChatHeader({
  user,
  isLoggedIn,
  sidebarCollapsed,
  conversationTitle,
  model,
  onToggleSidebar,
  onNewChat,
  onOpenSearch,
  onOpenMobileSidebar,
  onModelChange,
  onLogout,
  onLogin,
}: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-transparent px-4 py-3">
      {/* Left: mobile menu + brand title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-gray-100 hover:cursor-pointer md:hidden"
          aria-label="打开侧边栏"
        >
          <LineIcon name={LINE_ICONS.menu} size={18} />
        </button>

        {sidebarCollapsed ? (
          <div className="hidden items-center gap-3 md:flex">
            <BrandLogo size="sm" />
            <CompactSidebarToolbar
              collapsed={sidebarCollapsed}
              onToggleCollapse={onToggleSidebar}
              onNewChat={onNewChat}
              onOpenSearch={onOpenSearch}
            />
          </div>
        ) : (
          <>
            <div className="min-w-0">
              <h1 className="truncate text-base font-medium text-[var(--text-primary)]">
                {conversationTitle || "新对话"}
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <LineIcon
                  name={LINE_ICONS.bolt}
                  size={14}
                  className="text-[var(--accent)]"
                />
                <select
                  value={model}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="max-w-[180px] cursor-pointer truncate border-none bg-transparent p-0 text-xs text-[var(--accent)] focus:outline-none"
                  aria-label="选择模型"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: upgrade + user dropdown / login */}
      <div className="flex shrink-0 items-center gap-3">
        {isLoggedIn && (
          <>
            <button
              type="button"
              className="hidden items-center gap-1 text-sm font-medium text-[var(--accent)] sm:flex hover:cursor-pointer"
            >
              <LineIcon name={LINE_ICONS.bolt} size={16} />
              升级
            </button>
            {/* 用户名下拉菜单 */}
            <UserDropdown
              username={user.username}
              onLogout={onLogout}
            />
          </>
        )}
        {!isLoggedIn && (
          <button
            type="button"
            onClick={onLogin}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 hover:cursor-pointer"
          >
            登录
          </button>
        )}
      </div>
    </header>
  );
}

/* ── User dropdown ─────────────────────────────────────────────── */
function UserDropdown({ username, onLogout }: { username: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!mounted) return null;

  const menu = open ? createPortal(
    <div
      ref={menuRef}
      className="fixed right-4 top-[52px] z-[120] min-w-[160px] overflow-hidden rounded-xl border border-[var(--border)] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      <div className="px-3 py-2 text-xs text-[var(--text-tertiary)]">{username}</div>
      <div className="border-t border-[var(--border)]" />
      <button
        type="button"
        onClick={() => { setOpen(false); onLogout(); }}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50 hover:cursor-pointer"
      >
        <LineIcon name={LINE_ICONS.logout} size={16} />
        退出登录
      </button>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-100"
      >
        <span className="text-sm text-[var(--text-secondary)]">{username}</span>
        <LineIcon
          name={open ? LINE_ICONS.chevronUp : LINE_ICONS.chevronDown}
          size={14}
          className="text-[var(--text-muted)]"
        />
      </div>
      {menu}
    </>
  );
}
