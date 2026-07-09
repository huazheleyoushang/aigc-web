"use client";

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

      {/* Right: upgrade + user info / login */}
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
            <span className="hidden text-sm text-[var(--text-secondary)] sm:inline">
              {user.username}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg px-3 py-1.5 text-[var(--text-secondary)] transition hover:bg-gray-100 hover:text-[var(--text-primary)] hover:cursor-pointer"
            >
              登出
            </button>
          </>
        )}
        {!isLoggedIn && (
          <button
            type="button"
            onClick={onLogin}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent)]/90 hover:cursor-pointer"
          >
            登录
          </button>
        )}
      </div>
    </header>
  );
}
