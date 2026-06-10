interface BrandLogoProps {
  showText?: boolean;
  className?: string;
}

export function BrandLogo({ showText = true, className = "" }: BrandLogoProps) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
        A
      </div>
      {showText && (
        <span className="truncate text-base font-semibold text-[var(--accent)]">
          AIGC Chat
        </span>
      )}
    </div>
  );
}
