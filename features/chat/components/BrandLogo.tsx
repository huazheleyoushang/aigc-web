interface BrandLogoProps {
  showText?: boolean;
  className?: string;
}

/** ChatGPT 风格：绿色圆形 + 白色螺旋条纹 SVG */
const AIGC_LOGO = (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 shrink-0"
    aria-hidden="true"
  >
    <circle cx="20" cy="20" r="20" fill="#10b981" />
    {/* 螺旋条纹：从外向内连续卷曲 */}
    <path
      d="M20 10a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M20 14a6 6 0 0 1 6 6 6 6 0 0 1-6 6"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="20" r="1.5" fill="white" />
  </svg>
);

export function BrandLogo({ showText = true, className = "" }: BrandLogoProps) {
  return (
    <div className={`flex min-w-0 items-center gap-1.5 ${className}`}>
      {AIGC_LOGO}
      {showText && (
        <span className="truncate text-base font-semibold text-[var(--text-primary)]">
          AIGC Chat
        </span>
      )}
    </div>
  );
}
