/**
 * LLM Bridge compatibility layer.
 * Keeps the previous chat store interface while delegating to the AI router.
 */

import { aiRouter } from "./ai";
import { AIGenerationOptions } from "./ai/types";

export interface LLMOptions extends AIGenerationOptions {}

export interface LLMBridge {
  isAvailable(): boolean;
  generateResponse(prompt: string, options?: LLMOptions): Promise<string>;
  generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: LLMOptions,
  ): Promise<void>;
}

class RoutedLLMBridge implements LLMBridge {
  isAvailable(): boolean {
    return aiRouter.isAvailable();
  }

  async generateResponse(
    prompt: string,
    options?: LLMOptions,
  ): Promise<string> {
    const response = await aiRouter.generateResponse(
      prompt,
      normalizeOptions(options),
    );
    return response.text;
  }

  async generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: LLMOptions,
  ): Promise<void> {
    await aiRouter.generateResponseStream(
      prompt,
      onToken,
      normalizeOptions(options),
    );
  }
}

function normalizeOptions(
  options?: LLMOptions,
): AIGenerationOptions | undefined {
  if (!options) {
    return undefined;
  }

  return {
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    stopSequences: options.stopSequences,
    requestContext: options.requestContext,
  };
}

/**
 * Factory function to create the appropriate LLM bridge
 * Uses the hybrid AI router while preserving the legacy interface
 */
function createLLMBridge(): LLMBridge {
  return new RoutedLLMBridge();
}

// Singleton instance
export const llmBridge: LLMBridge = createLLMBridge();
