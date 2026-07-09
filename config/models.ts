export interface ModelConfig {
  id: string;
  label: string;
  isDefault?: boolean;
}

export const MODELS: ModelConfig[] = [
  {
    id: "agnes-2.0-flash",
    label: "Agnes 2.0 Flash",
  },
  {
    id: "xopqwen36v35b",
    label: "Qwen3.6-35B-A3B",
    isDefault: true,
  }
];

export function getDefaultModel(): ModelConfig {
  return MODELS.find((m) => m.isDefault) ?? MODELS[0];
}

export function isModelAllowed(model: string): boolean {
  return MODELS.some((m) => m.id === model);
}

/** 校验模型 ID，非法时回退默认模型 */
export function resolveModel(model?: string): string {
  if (model && isModelAllowed(model)) return model;
  return getDefaultModel().id;
}
