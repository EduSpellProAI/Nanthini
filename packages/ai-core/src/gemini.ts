import type { AIGenerationRequest, AIJsonParser } from './types';

function readEnv(name: string): string {
  const envObject = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return envObject?.[name] ?? '';
}

function stripCodeBlock(value: string): string {
  return value.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
}

function createPromptHash(prompt: string): string {
  let hash = 2166136261;
  for (let i = 0; i < prompt.length; i += 1) {
    hash ^= prompt.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return `ai-${Math.abs(hash >>> 0).toString(16)}`;
}

export class GeminiClient {
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(apiKey = readEnv('GEMINI_API_KEY'), defaultModel = readEnv('GEMINI_MODEL') || 'gemini-2.5-flash') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  private getEndpoint(model: string): string {
    if (!this.apiKey) {
      throw new Error('Missing GEMINI_API_KEY for AI generation.');
    }

    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
  }

  async generateText(request: AIGenerationRequest): Promise<{ text: string; model: string; promptHash: string; latencyMs: number }> {
    const model = request.model || this.defaultModel;
    const start = Date.now();

    const response = await fetch(this.getEndpoint(model), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          role: 'system',
          parts: [{ text: request.systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: request.userPrompt }],
          },
        ],
        generationConfig: {
          temperature: request.temperature ?? 0.35,
          maxOutputTokens: request.maxOutputTokens ?? 2048,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Gemini API request failed (${response.status}): ${message}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim();
    if (!text) {
      throw new Error('Gemini API returned an empty response.');
    }

    const latencyMs = Date.now() - start;
    return {
      text: stripCodeBlock(text),
      model,
      promptHash: createPromptHash(`${request.systemPrompt}\n${request.userPrompt}`),
      latencyMs,
    };
  }

  async generateJson<T>(request: AIGenerationRequest, parser: AIJsonParser<T>): Promise<{ data: T; model: string; promptHash: string; latencyMs: number }> {
    const result = await this.generateText(request);
    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(result.text);
    } catch (error) {
      throw new Error(`Gemini returned non-JSON content: ${error instanceof Error ? error.message : 'parse error'}`);
    }

    return {
      data: parser.parse(parsedJson),
      model: result.model,
      promptHash: result.promptHash,
      latencyMs: result.latencyMs,
    };
  }
}

export const geminiClient = new GeminiClient();
