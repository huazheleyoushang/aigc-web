import { LINE_ICONS, LineIcon } from "@/components/LineIcon";

interface SidebarToggleButtonProps {
  collapsed: boolean;
  onClick: () => void;
  className?: string;
}

export function SidebarToggleButton({
  collapsed,
  onClick,
  className = "",
}: SidebarToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
      title={collapsed ? "展开侧边栏" : "收起侧边栏"}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-gray-100 hover:text-[var(--text-primary)] hover:cursor-pointer ${className}`}
    >
      <LineIcon
        name={LINE_ICONS.layout}
        size={18}
        className={collapsed ? "" : "lni-rotate-180"}
      />
    </button>
  );
}
