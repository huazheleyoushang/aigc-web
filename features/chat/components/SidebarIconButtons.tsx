import { LINE_ICONS, LineIcon } from "@/components/LineIcon";

interface IconButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  icon: (typeof LINE_ICONS)[keyof typeof LINE_ICONS];
}

function IconButton({
  label,
  onClick,
  className = "",
  icon,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-gray-100 hover:text-[var(--text-primary)] hover:cursor-pointer ${className}`}
    >
      <LineIcon name={icon} size={18} />
    </button>
  );
}

export function SearchIconButton({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <IconButton
      label="搜索对话"
      icon={LINE_ICONS.search}
      className={className}
      onClick={onClick}
    />
  );
}

export function NewChatIconButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <IconButton
      label="开启新对话"
      icon={LINE_ICONS.commentPlus}
      onClick={onClick}
      className={className}
    />
  );
}
