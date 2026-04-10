import { localOpenSourceProvider } from "./providers/localProvider";
import { onlineBackendProvider } from "./providers/onlineProvider";
import {
    AIGenerationOptions,
    AIProvider,
    AIRequestContext,
    AIResponseEnvelope,
    AISelectionResult,
} from "./types";

function resolveRequestContext(
  options?: AIGenerationOptions,
): AIRequestContext {
  return (
    options?.requestContext ?? {
      source: "chat",
      mode: "hybrid",
      freshDataRequired: false,
      allowNetwork: true,
    }
  );
}

export class AIRouter {
  constructor(
    private readonly localProvider: AIProvider = localOpenSourceProvider,
    private readonly onlineProvider: AIProvider = onlineBackendProvider,
  ) {}

  isAvailable(): boolean {
    return (
      this.localProvider.isAvailable() || this.onlineProvider.isAvailable()
    );
  }

  selectProvider(options?: AIGenerationOptions): AISelectionResult {
    const requestContext = resolveRequestContext(options);

    if (
      requestContext.allowNetwork &&
      (requestContext.mode === "online" || requestContext.freshDataRequired) &&
      this.onlineProvider.isAvailable()
    ) {
      return {
        providerId: this.onlineProvider.id,
        modelId: this.onlineProvider.describe().id,
        reason:
          "Network allowed and fresh data requested or online mode selected.",
      };
    }

    if (this.localProvider.isAvailable()) {
      return {
        providerId: this.localProvider.id,
        modelId: this.localProvider.describe().id,
        reason: "Local open-source model selected as offline-first default.",
      };
    }

    if (this.onlineProvider.isAvailable()) {
      return {
        providerId: this.onlineProvider.id,
        modelId: this.onlineProvider.describe().id,
        reason: "Local model unavailable, using online fallback.",
      };
    }

    throw new Error("No AI provider is available.");
  }

  private resolveProvider(providerId: string): AIProvider {
    if (providerId === this.localProvider.id) {
      return this.localProvider;
    }

    if (providerId === this.onlineProvider.id) {
      return this.onlineProvider;
    }

    throw new Error(`Unknown AI provider: ${providerId}`);
  }

  async generateResponse(
    prompt: string,
    options?: AIGenerationOptions,
  ): Promise<AIResponseEnvelope> {
    const selection = this.selectProvider(options);
    const provider = this.resolveProvider(selection.providerId);
    return provider.generateResponse(prompt, options);
  }

  async generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: AIGenerationOptions,
  ): Promise<void> {
    const selection = this.selectProvider(options);
    const provider = this.resolveProvider(selection.providerId);
    await provider.generateResponseStream(prompt, onToken, options);
  }
}

export const aiRouter = new AIRouter();
