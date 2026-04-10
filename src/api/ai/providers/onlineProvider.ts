import { AI_MODEL_CATALOG, DEFAULT_ONLINE_MODEL_ID } from "../catalog";
import {
    AIGenerationOptions,
    AIModelProfile,
    AIProvider,
    AIResponseEnvelope,
} from "../types";

function readBackendBaseUrl(): string {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };

  return runtime.process?.env?.EXPO_PUBLIC_AI_BACKEND_URL?.trim() ?? "";
}

function buildResponseMetadata(modelId: string) {
  return {
    providerId: "remote-rag-gateway",
    modelId,
    mode: "online" as const,
    cached: false,
    createdAt: new Date().toISOString(),
  };
}

function streamResponse(
  text: string,
  onToken: (token: string) => void,
): Promise<void> {
  const words = text.split(" ");
  return words.reduce<Promise<void>>((chain, word) => {
    return chain.then(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            onToken(`${word} `);
            resolve();
          }, 25);
        }),
    );
  }, Promise.resolve());
}

export class OnlineBackendProvider implements AIProvider {
  readonly id = "remote-rag-gateway";
  readonly kind = "remote-backend" as const;
  readonly mode = "online" as const;

  private readonly profile: AIModelProfile =
    AI_MODEL_CATALOG.online.find(
      (model) => model.id === DEFAULT_ONLINE_MODEL_ID,
    ) ?? AI_MODEL_CATALOG.online[0];

  describe(): AIModelProfile {
    return this.profile;
  }

  isAvailable(): boolean {
    return readBackendBaseUrl().length > 0;
  }

  capabilities() {
    return {
      offline: false,
      online: true,
      streaming: true,
      freshData: true,
    };
  }

  async generateResponse(
    prompt: string,
    options?: AIGenerationOptions,
  ): Promise<AIResponseEnvelope> {
    const baseUrl = readBackendBaseUrl();

    if (!baseUrl) {
      throw new Error(
        "Online AI backend URL is not configured. Set EXPO_PUBLIC_AI_BACKEND_URL.",
      );
    }

    const response = await fetch(`${baseUrl}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        maxTokens: options?.maxTokens ?? 512,
        temperature: options?.temperature ?? 0.7,
        stopSequences: options?.stopSequences ?? [],
        requestContext: options?.requestContext ?? null,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Online AI backend failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as {
      text?: string;
      response?: string;
      modelId?: string;
    };

    const text = payload.text ?? payload.response ?? "";

    return {
      text,
      metadata: buildResponseMetadata(payload.modelId ?? this.profile.id),
    };
  }

  async generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: AIGenerationOptions,
  ): Promise<void> {
    const response = await this.generateResponse(prompt, options);
    await streamResponse(response.text, onToken);
  }
}

export const onlineBackendProvider = new OnlineBackendProvider();
