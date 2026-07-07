export interface AIGenerationRequest {
  feature: string;
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface AIGenerationTrace {
  feature: string;
  model: string;
  promptHash: string;
  responsePreview: string;
  latencyMs: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AIJsonParser<T> {
  parse(value: unknown): T;
}
