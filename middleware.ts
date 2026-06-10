import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { APP_CONFIG } from "@/config/app";

function hasValidSession(request: NextRequest): boolean {
  const token = request.cookies.get(APP_CONFIG.sessionCookieName)?.value;
  if (!token) return false;
  try {
    const json = Buffer.from(token, "base64url").toString("utf-8");
    const data = JSON.parse(json) as { userId?: string };
    return Boolean(data.userId);
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = hasValidSession(request);

  if (pathname.startsWith("/login")) {
    if (authenticated) {
      return NextResponse.redirect(new URL("/chat", request.url));
    }
    return NextResponse.next();
  }

  // 兼容旧链接 /chat/{id} → /chat
  if (/^\/chat\/.+/.test(pathname)) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  if (pathname === "/chat") {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/chat")) {
    if (!authenticated) {
      return NextResponse.json(
        { error: { code: "unauthorized", message: "未登录" } },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/chat/:path*", "/api/chat"],
};
