import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { APP_CONFIG, MOCK_USERS } from "@/config/app";
import type { User } from "@/types/domain";

export interface SessionData {
  userId: string;
  username: string;
  createdAt: number;
}

function encodeSession(data: SessionData): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

function decodeSession(token: string): SessionData | null {
  try {
    const json = Buffer.from(token, "base64url").toString("utf-8");
    const data = JSON.parse(json) as SessionData;
    if (!data.userId || !data.username) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(APP_CONFIG.sessionCookieName)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export function createSessionCookie(data: SessionData): string {
  const value = encodeSession(data);
  const maxAge = APP_CONFIG.sessionMaxAge;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${APP_CONFIG.sessionCookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie(): string {
  return `${APP_CONFIG.sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function validateMockCredentials(
  username: string,
  password: string,
): boolean {
  return MOCK_USERS.some(
    (u) => u.username === username && u.password === password,
  );
}

export function loginUser(
  username: string,
  existingUserId?: string,
): { user: User; cookie: string } {
  const now = Date.now();
  const user: User = {
    id: existingUserId ?? uuidv4(),
    username,
    createdAt: now,
  };
  const session: SessionData = {
    userId: user.id,
    username: user.username,
    createdAt: now,
  };
  return { user, cookie: createSessionCookie(session) };
}

export function setSessionCookieOnResponse(
  response: NextResponse,
  cookie: string,
): NextResponse {
  response.headers.append("Set-Cookie", cookie);
  return response;
}
