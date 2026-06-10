import {
  encodeStreamDone,
  encodeStreamEvent,
  type StreamEvent,
} from "@/types/stream";
import { extractErrorFromSseData } from "@/lib/llm/upstream-error";

interface OpenAIStreamChunk {
  error?: {
    code?: number | string;
    message?: string;
  };
  choices?: Array<{
    delta?: {
      content?: string | null;
      reasoning_content?: string | null;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

function parseSseLines(buffer: string): { events: string[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  return { events: parts, rest };
}

function getSseDataLine(raw: string): string | null {
  const line = raw.split("\n").find((l) => l.startsWith("data:"));
  if (!line) return null;
  return line.slice(5).trim();
}

function parseUpstreamEvent(raw: string): OpenAIStreamChunk | null {
  const data = getSseDataLine(raw);
  if (!data || data === "[DONE]") return null;
  try {
    return JSON.parse(data) as OpenAIStreamChunk;
  } catch {
    return null;
  }
}

function chunkToStreamEvents(chunk: OpenAIStreamChunk): StreamEvent[] {
  if (chunk.error?.message) {
    return [
      {
        type: "error",
        code: String(chunk.error.code ?? "upstream_error"),
        message: chunk.error.message,
      },
    ];
  }

  const events: StreamEvent[] = [];
  const delta = chunk.choices?.[0]?.delta;
  if (!delta) {
    if (chunk.usage) {
      events.push({
        type: "done",
        usage: {
          promptTokens: chunk.usage.prompt_tokens ?? 0,
          completionTokens: chunk.usage.completion_tokens ?? 0,
        },
      });
    }
    return events;
  }

  const reasoning =
    delta.reasoning_content ||
    (delta as Record<string, string | null | undefined>).reasoning;
  if (reasoning) {
    events.push({ type: "thinking", delta: reasoning });
  }
  if (delta.content) {
    events.push({ type: "content", delta: delta.content });
  }
  return events;
}

function emitErrorAndClose(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  code: string,
  message: string,
): void {
  controller.enqueue(
    encoder.encode(
      encodeStreamEvent({ type: "error", code, message }),
    ),
  );
  controller.enqueue(encoder.encode(encodeStreamDone()));
  controller.close();
}

/** Transform upstream SSE stream into internal StreamEvent SSE. */
export function transformUpstreamStream(
  upstream: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          if (signal?.aborted) {
            controller.close();
            break;
          }
          const { done, value } = await reader.read();
          if (done) {
            // 处理缓冲区残留（可能含未分隔完的错误帧）
            if (buffer.trim()) {
              const data = getSseDataLine(buffer);
              if (data) {
                const sseError = extractErrorFromSseData(data);
                if (sseError) {
                  emitErrorAndClose(
                    controller,
                    encoder,
                    sseError.code,
                    sseError.message,
                  );
                  return;
                }
              }
            }
            controller.enqueue(encoder.encode(encodeStreamDone()));
            controller.close();
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const { events, rest } = parseSseLines(buffer);
          buffer = rest;
          for (const eventStr of events) {
            const data = getSseDataLine(eventStr);
            if (data) {
              const sseError = extractErrorFromSseData(data);
              if (sseError) {
                emitErrorAndClose(
                  controller,
                  encoder,
                  sseError.code,
                  sseError.message,
                );
                await reader.cancel();
                return;
              }
            }

            const chunk = parseUpstreamEvent(eventStr);
            if (!chunk) continue;
            for (const event of chunkToStreamEvents(chunk)) {
              if (event.type === "error") {
                emitErrorAndClose(
                  controller,
                  encoder,
                  event.code,
                  event.message,
                );
                await reader.cancel();
                return;
              }
              controller.enqueue(encoder.encode(encodeStreamEvent(event)));
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        if (!signal?.aborted) {
          emitErrorAndClose(controller, encoder, "stream_error", message);
        } else {
          controller.close();
        }
      } finally {
        reader.releaseLock();
      }
    },
    cancel() {
      upstream.cancel();
    },
  });
}
