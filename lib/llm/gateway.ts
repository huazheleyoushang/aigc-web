import { APP_CONFIG } from "@/config/app";
import { isModelAllowed, getDefaultModel } from "@/config/models";
import { buildContext } from "@/lib/llm/context";
import { createMaasCompletion } from "@/lib/llm/maas-provider";
import { transformUpstreamStream } from "@/lib/llm/stream-parser";
import { parseUpstreamErrorResponse } from "@/lib/llm/upstream-error";
import type { ChatMessagePayload } from "@/types/domain";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export interface ChatGatewayRequest {
  messages: ChatMessagePayload[];
  model?: string;
  clientIp?: string;
  signal?: AbortSignal;
}

export interface GatewayError {
  status: number;
  code: string;
  message: string;
}

export function checkRateLimit(clientIp: string): GatewayError | null {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, {
      count: 1,
      resetAt: now + 60_000,
    });
    return null;
  }
  if (entry.count >= APP_CONFIG.rateLimitPerMinute) {
    return {
      status: 429,
      code: "rate_limit",
      message: "请求过于频繁，请稍后重试",
    };
  }
  entry.count += 1;
  return null;
}

export function validateChatRequest(
  body: unknown,
): { ok: true; data: ChatGatewayRequest } | { ok: false; error: GatewayError } {
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      error: { status: 400, code: "invalid_body", message: "请求体无效" },
    };
  }

  const { messages, model } = body as {
    messages?: unknown;
    model?: unknown;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      ok: false,
      error: { status: 400, code: "invalid_messages", message: "messages 不能为空" },
    };
  }

  if (messages.length > APP_CONFIG.maxMessagesPerRequest) {
    return {
      ok: false,
      error: {
        status: 400,
        code: "too_many_messages",
        message: `消息条数不能超过 ${APP_CONFIG.maxMessagesPerRequest}`,
      },
    };
  }

  const parsed: ChatMessagePayload[] = [];
  let totalChars = 0;

  for (const msg of messages) {
    if (
      !msg ||
      typeof msg !== "object" ||
      !("role" in msg) ||
      !("content" in msg)
    ) {
      return {
        ok: false,
        error: { status: 400, code: "invalid_message", message: "消息格式无效" },
      };
    }
    const { role, content } = msg as { role: string; content: string };
    if (!["user", "assistant", "system"].includes(role)) {
      return {
        ok: false,
        error: { status: 400, code: "invalid_role", message: "消息角色无效" },
      };
    }
    if (typeof content !== "string") {
      return {
        ok: false,
        error: { status: 400, code: "invalid_content", message: "消息内容无效" },
      };
    }
    totalChars += content.length;
    parsed.push({ role: role as ChatMessagePayload["role"], content });
  }

  if (totalChars > APP_CONFIG.maxTotalChars) {
    return {
      ok: false,
      error: {
        status: 400,
        code: "payload_too_large",
        message: "消息总长度超出限制",
      },
    };
  }

  const resolvedModel =
    typeof model === "string" && model ? model : getDefaultModel().id;

  if (!isModelAllowed(resolvedModel)) {
    return {
      ok: false,
      error: { status: 400, code: "model_not_allowed", message: "模型不可用" },
    };
  }

  return {
    ok: true,
    data: {
      messages: buildContext(parsed),
      model: resolvedModel,
    },
  };
}

function jsonErrorResponse(
  code: string,
  message: string,
  status: number,
): Response {
  return Response.json({ error: { code, message } }, { status });
}

export async function handleChatCompletion(
  request: ChatGatewayRequest,
): Promise<Response> {
  let upstream: Response;
  try {
    upstream = await createMaasCompletion({
      messages: request.messages,
      model: request.model,
      signal: request.signal,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "无法连接上游服务";
    return jsonErrorResponse("upstream_network_error", message, 502);
  }

  if (!upstream.ok) {
    const parsed = await parseUpstreamErrorResponse(upstream);
    if (process.env.NODE_ENV === "development") {
      console.error("[chat] upstream http error:", parsed);
    }
    return jsonErrorResponse(
      parsed.code,
      parsed.message,
      upstream.status >= 400 ? upstream.status : 502,
    );
  }

  if (!upstream.body) {
    return jsonErrorResponse("upstream_error", "上游未返回流", 502);
  }

  const stream = transformUpstreamStream(upstream.body, request.signal);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
