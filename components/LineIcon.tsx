import type { HTMLAttributes } from "react";

export const LINE_ICONS = {
  search: "search-1",
  plus: "plus",
  layout: "layout-9",
  clipboard: "clipboard",
  pencil: "pencil-1",
  refresh: "refresh-circle-1-clockwise",
  thumbsUp: "thumbs-up-3",
  thumbsDown: "thumbs-down-3",
  share: "share-1",
  menu: "menu-hamburger-1",
  more: "menu-meatballs-1",
  pin: "map-pin-5",
  trash: "trash-3",
  pause: "pause",
  send: "arrow-upward",
  bolt: "bolt-2",
  comment: "comment-1",
  commentPlus: "comment-1-share",
  close: "xmark",
  folder: "folder-1",
  briefcase: "briefcase-2",
  grid: "layout-9",
  code: "code-1",
  microphone: "microphone-1",
} as const;

export type LineIconName = (typeof LINE_ICONS)[keyof typeof LINE_ICONS];

interface LineIconProps extends HTMLAttributes<HTMLElement> {
  name: LineIconName;
  size?: number;
}

export function LineIcon({
  name,
  size = 18,
  className = "",
  style,
  ...props
}: LineIconProps) {
  return (
    <i
      className={`lni lni-${name} leading-none ${className}`}
      style={{ fontSize: size, ...style }}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    />
  );
}
