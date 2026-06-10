import { getDefaultModel } from "@/config/models";
import type { ChatMessagePayload } from "@/types/domain";

export interface ChatCompletionOptions {
  messages: ChatMessagePayload[];
  model?: string;
  signal?: AbortSignal;
}

export class MaasConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaasConfigError";
  }
}

export function getMaasConfig() {
  const baseUrl = process.env.MAAS_API_BASE_URL;
  const apiKey = process.env.MAAS_API_KEY;

  if (!baseUrl || !apiKey || apiKey === "your_api_key_here") {
    throw new MaasConfigError(
      "请在 .env.local 中配置 MAAS_API_BASE_URL 和 MAAS_API_KEY",
    );
  }

  return { baseUrl, apiKey };
}

export async function createMaasCompletion(
  options: ChatCompletionOptions,
): Promise<Response> {
  const { baseUrl, apiKey } = getMaasConfig();

  const model = options.model ?? process.env.DEFAULT_MODEL ?? getDefaultModel().id;
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      stream: true,
    }),
    signal: options.signal,
  });
}
