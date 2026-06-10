export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export type StreamEvent =
  | { type: "thinking"; delta: string }
  | { type: "content"; delta: string }
  | { type: "done"; usage?: TokenUsage }
  | { type: "error"; code: string; message: string };

export function encodeStreamEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function encodeStreamDone(): string {
  return "data: [DONE]\n\n";
}
