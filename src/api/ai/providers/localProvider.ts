import { AI_MODEL_CATALOG, DEFAULT_LOCAL_MODEL_ID } from "../catalog";
import {
    AIGenerationOptions,
    AIModelProfile,
    AIProvider,
    AIResponseEnvelope,
} from "../types";

function buildResponseMetadata(modelId: string) {
  return {
    providerId: "local-open-source-provider",
    modelId,
    mode: "offline" as const,
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
          }, 35);
        }),
    );
  }, Promise.resolve());
}

export class LocalOpenSourceProvider implements AIProvider {
  readonly id = "local-open-source-provider";
  readonly kind = "local-open-source" as const;
  readonly mode = "offline" as const;

  private readonly profile: AIModelProfile =
    AI_MODEL_CATALOG.local.find(
      (model) => model.id === DEFAULT_LOCAL_MODEL_ID,
    ) ?? AI_MODEL_CATALOG.local[0];

  describe(): AIModelProfile {
    return this.profile;
  }

  isAvailable(): boolean {
    return true;
  }

  capabilities() {
    return {
      offline: true,
      online: false,
      streaming: true,
      freshData: false,
    };
  }

  async generateResponse(
    prompt: string,
    options?: AIGenerationOptions,
  ): Promise<AIResponseEnvelope> {
    void options;

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      text: this.createMockResponse(prompt),
      metadata: buildResponseMetadata(this.profile.id),
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

  private createMockResponse(prompt: string): string {
    const normalizedPrompt = prompt.toLowerCase();

    if (normalizedPrompt.includes("presupuesto")) {
      return "Puedo ayudarte a revisar el presupuesto por categoría y detectar dónde estás gastando más de lo necesario.";
    }

    if (
      normalizedPrompt.includes("gasto") ||
      normalizedPrompt.includes("gastos")
    ) {
      return "Veo que hay espacio para organizar mejor tus gastos. Si quieres, puedo resumir los puntos más importantes por categoría.";
    }

    if (normalizedPrompt.includes("ahorro")) {
      return "Tu objetivo de ahorro puede crecer si automatizas una pequeña porción fija cada mes y revisas gastos variables.";
    }

    if (
      normalizedPrompt.includes("sistema") ||
      normalizedPrompt.includes("app")
    ) {
      return "Puedo describir el sistema, sus módulos y el flujo de datos entre UI, lógica, base local y capa de IA.";
    }

    return "Estoy listo para responder en modo local. Si necesitas información actualizada, puedo enrutar la consulta al backend online.";
  }
}

export const localOpenSourceProvider = new LocalOpenSourceProvider();
