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

/** 按模型 ID 获取 API 提供商配置 */
function getProviderConfig(model: string): { baseUrl: string; apiKey: string } {
  // Agnes AI 提供商
  if (model === "agnes-2.0-flash") {
    const baseUrl = process.env.AGENES_API_BASE_URL;
    const apiKey = process.env.AGENES_API_KEY;
    if (!baseUrl || !apiKey) {
      throw new MaasConfigError(
        "请在 .env.local 中配置 AGENES_API_BASE_URL 和 AGENES_API_KEY",
      );
    }
    return { baseUrl, apiKey };
  }

  // 默认：讯飞 MaaS 提供商
  const baseUrl = process.env.MAAS_API_BASE_URL;
  const apiKey = process.env.MAAS_API_KEY;
  if (!baseUrl || !apiKey || apiKey === "your_api_key_here") {
    throw new MaasConfigError(
      "请在 .env.local 中配置 MAAS_API_BASE_URL 和 MAAS_API_KEY",
    );
  }
  return { baseUrl, apiKey };
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
  const model = options.model ?? process.env.DEFAULT_MODEL ?? getDefaultModel().id;
  const { baseUrl, apiKey } = getProviderConfig(model);

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
