export interface MessageSource {
  url: string;
  title: string;
  domain: string;
}

function normalizeUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 从 Markdown 正文中提取链接作为信息来源 */
export function extractSourcesFromMarkdown(content: string): MessageSource[] {
  const map = new Map<string, MessageSource>();

  const linkRegex = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = normalizeUrl(match[2]);
    if (!href || map.has(href)) continue;
    map.set(href, {
      url: href,
      title: match[1].trim() || getDomain(href),
      domain: getDomain(href),
    });
  }

  const bareRegex = /https?:\/\/[^\s<>)\]"']+/g;
  while ((match = bareRegex.exec(content)) !== null) {
    const href = normalizeUrl(match[0].replace(/[.,;:!?]+$/, ""));
    if (!href || map.has(href)) continue;
    map.set(href, {
      url: href,
      title: getDomain(href),
      domain: getDomain(href),
    });
  }

  return Array.from(map.values());
}

export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}
