interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightText({ text, query, className = "" }: HighlightTextProps) {
  const keyword = query.trim();
  if (!keyword) {
    return <span className={className}>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);

  if (index < 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {text.slice(0, index)}
      <strong className="font-semibold text-[var(--text-primary)]">
        {text.slice(index, index + keyword.length)}
      </strong>
      {text.slice(index + keyword.length)}
    </span>
  );
}
