import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 兼容旧链接 /chat/{id} → /chat
  if (/^\/chat\/.+/.test(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/chat/:path*", "/api/chat"],
};
