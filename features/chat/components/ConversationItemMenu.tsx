"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { LINE_ICONS, LineIcon } from "@/components/LineIcon";

interface MenuItem {
  key: string;
  label: string;
  icon: (typeof LINE_ICONS)[keyof typeof LINE_ICONS];
  danger?: boolean;
  onClick: () => void;
}

interface ConversationItemMenuProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  pinned?: boolean;
  onClose: () => void;
  onRename: () => void;
  onTogglePin: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const MENU_MIN_WIDTH = 140;

function getMenuPosition(anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const left = Math.min(
    Math.max(8, rect.right - MENU_MIN_WIDTH),
    window.innerWidth - MENU_MIN_WIDTH - 8,
  );

  return {
    top: rect.bottom + 4,
    left,
  };
}

export function ConversationItemMenu({
  open,
  anchorRef,
  pinned,
  onClose,
  onRename,
  onTogglePin,
  onShare,
  onDelete,
}: ConversationItemMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      if (!anchorRef.current) return;
      setPosition(getMenuPosition(anchorRef.current));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !mounted) return null;

  const items: MenuItem[] = [
    {
      key: "rename",
      label: "重命名",
      icon: LINE_ICONS.pencil,
      onClick: onRename,
    },
    {
      key: "pin",
      label: pinned ? "取消置顶" : "置顶",
      icon: LINE_ICONS.pin,
      onClick: onTogglePin,
    },
    {
      key: "share",
      label: "分享",
      icon: LINE_ICONS.share,
      onClick: onShare,
    },
    {
      key: "delete",
      label: "删除",
      icon: LINE_ICONS.trash,
      danger: true,
      onClick: onDelete,
    },
  ];

  return createPortal(
    <div
      ref={menuRef}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[120] min-w-[140px] overflow-hidden rounded-xl border border-[var(--border)] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            item.onClick();
            onClose();
          }}
          className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition hover:bg-gray-100 hover:cursor-pointer ${
            item.danger
              ? "text-red-500 hover:bg-red-50"
              : "text-[var(--text-primary)]"
          }`}
        >
          <span
            className={
              item.danger ? "text-red-500" : "text-[var(--text-secondary)]"
            }
          >
            <LineIcon name={item.icon} size={16} />
          </span>
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
