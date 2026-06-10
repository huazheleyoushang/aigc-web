import { NextResponse } from "next/server";
import {
  loginUser,
  setSessionCookieOnResponse,
  validateMockCredentials,
} from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      userId?: string;
    };

    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";
    const userId =
      typeof body.userId === "string" && body.userId ? body.userId : undefined;

    if (!validateMockCredentials(username, password)) {
      return NextResponse.json(
        { error: { message: "账号或密码错误" } },
        { status: 401 },
      );
    }

    const { user, cookie } = loginUser(username, userId);
    const response = NextResponse.json({ user });
    return setSessionCookieOnResponse(response, cookie);
  } catch {
    return NextResponse.json(
      { error: { message: "请求无效" } },
      { status: 400 },
    );
  }
}
