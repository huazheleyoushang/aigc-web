"use client";

import { useCallback } from "react";
import { createId } from "@/lib/utils";
import type { ChatMessagePayload } from "@/types/domain";
import type { StreamEvent } from "@/types/stream";

export interface StreamCallbacks {
  onThinking?: (delta: string) => void;
  onContent?: (delta: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

function isAbortError(err: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    return (
      err.name === "AbortError" ||
      message.includes("aborted") ||
      message.includes("bodystreambuffer")
    );
  }
  return false;
}

function parseSseChunk(buffer: string): { events: StreamEvent[]; rest: string } {
  const events: StreamEvent[] = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";

  for (const part of parts) {
    const line = part.split("\n").find((l) => l.startsWith("data:"));
    if (!line) continue;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    try {
      events.push(JSON.parse(data) as StreamEvent);
    } catch {
      // skip malformed
    }
  }
  return { events, rest };
}

export function useChatStream() {
  const streamChat = useCallback(
    async (
      payload: {
        conversationId: string;
        messages: ChatMessagePayload[];
        model: string;
      },
      callbacks: StreamCallbacks,
      signal?: AbortSignal,
    ) => {
      const requestId = createId();

      let response: Response;
      try {
        response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(payload),
        signal,
        });
      } catch (err) {
        if (isAbortError(err, signal)) return;
        callbacks.onError?.(
          err instanceof Error ? err.message : "网络连接失败",
        );
        return;
      }

      if (!response.ok) {
        let message = "请求失败";
        try {
          const err = (await response.json()) as {
            error?: { message?: string };
          };
          message = err.error?.message ?? message;
        } catch {
          // ignore
        }
        callbacks.onError?.(message);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError?.("无法读取响应流");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let hasError = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const { events, rest } = parseSseChunk(buffer);
          buffer = rest;

          for (const event of events) {
            switch (event.type) {
              case "thinking":
                callbacks.onThinking?.(event.delta);
                break;
              case "content":
                callbacks.onContent?.(event.delta);
                break;
              case "done":
                if (!hasError) callbacks.onDone?.();
                break;
              case "error":
                hasError = true;
                callbacks.onError?.(event.message);
                break;
            }
          }
        }

        if (!signal?.aborted && !hasError) {
          callbacks.onDone?.();
        }
      } catch (err) {
        if (isAbortError(err, signal)) return;
        callbacks.onError?.(
          err instanceof Error ? err.message : "流读取失败",
        );
      } finally {
        try {
          await reader.cancel();
        } catch {
          // ignore cancel errors
        }
      }
    },
    [],
  );

  return { streamChat };
}
