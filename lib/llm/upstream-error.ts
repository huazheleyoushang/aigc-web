export interface UpstreamErrorPayload {
  code: string;
  message: string;
}

/** 解析上游 JSON 错误体（OpenAI / 讯飞等格式） */
export async function parseUpstreamErrorResponse(
  response: Response,
): Promise<UpstreamErrorPayload> {
  const fallback: UpstreamErrorPayload = {
    code: "upstream_error",
    message: `上游服务异常 (${response.status})`,
  };

  try {
    const text = await response.text();
    if (!text) return fallback;

    try {
      const body = JSON.parse(text) as Record<string, unknown>;
      return extractErrorFromBody(body) ?? fallback;
    } catch {
      return { code: "upstream_error", message: text.slice(0, 500) };
    }
  } catch {
    return fallback;
  }
}

/** 从 JSON 对象中提取 error 字段 */
export function extractErrorFromBody(
  body: Record<string, unknown>,
): UpstreamErrorPayload | null {
  const error = body.error;
  if (!error || typeof error !== "object") return null;

  const err = error as Record<string, unknown>;
  const message =
    (typeof err.message === "string" && err.message) ||
    (typeof err.msg === "string" && err.msg) ||
    (typeof body.message === "string" && body.message);

  if (!message) return null;

  const code =
    err.code != null
      ? String(err.code)
      : typeof err.type === "string"
        ? err.type
        : "upstream_error";

  return { code, message };
}

/** 从 SSE data 行原始 JSON 字符串提取错误 */
export function extractErrorFromSseData(data: string): UpstreamErrorPayload | null {
  if (!data || data === "[DONE]") return null;
  try {
    const body = JSON.parse(data) as Record<string, unknown>;
    return extractErrorFromBody(body);
  } catch {
    return null;
  }
}
