import { NewChatIconButton, SearchIconButton } from "@/features/chat/components/SidebarIconButtons";
import { SidebarToggleButton } from "@/features/chat/components/SidebarToggleButton";

interface CompactSidebarToolbarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
}

export function CompactSidebarToolbar({
  collapsed,
  onToggleCollapse,
  onNewChat,
  onOpenSearch,
}: CompactSidebarToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[var(--border)] bg-white px-1 py-1 shadow-sm">
      <SidebarToggleButton
        collapsed={collapsed}
        onClick={onToggleCollapse}
        className="rounded-full"
      />
      <SearchIconButton className="rounded-full" onClick={onOpenSearch} />
      <NewChatIconButton onClick={onNewChat} className="rounded-full" />
    </div>
  );
}
