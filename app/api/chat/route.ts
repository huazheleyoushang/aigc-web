import {
  checkRateLimit,
  handleChatCompletion,
  validateChatRequest,
} from "@/lib/llm/gateway";
import { MaasConfigError } from "@/lib/llm/maas-provider";
import { createId } from "@/lib/utils";

export async function POST(request: Request) {
  const requestId = request.headers.get("X-Request-Id") ?? createId();
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const rateLimitError = checkRateLimit(clientIp);
  if (rateLimitError) {
    return Response.json(
      { error: { code: rateLimitError.code, message: rateLimitError.message } },
      { status: rateLimitError.status },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "invalid_body", message: "请求体无效" } },
      { status: 400 },
    );
  }

  const validated = validateChatRequest(body);
  if (!validated.ok) {
    return Response.json(
      {
        error: {
          code: validated.error.code,
          message: validated.error.message,
        },
      },
      { status: validated.error.status },
    );
  }

  const start = Date.now();

  let response: Response;
  try {
    response = await handleChatCompletion({
      ...validated.data,
      signal: request.signal,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "服务暂时不可用";
    const isConfigError = error instanceof MaasConfigError;

    if (process.env.NODE_ENV === "development") {
      console.error("[chat] error:", error);
    }

    return Response.json(
      {
        error: {
          code: isConfigError ? "config_error" : "internal_error",
          message,
        },
      },
      { status: isConfigError ? 503 : 500 },
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[chat] requestId=${requestId} model=${validated.data.model} latency=${Date.now() - start}ms`,
    );
  }

  response.headers.set("X-Request-Id", requestId);
  return response;
}
