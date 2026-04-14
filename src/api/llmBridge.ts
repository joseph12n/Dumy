/**
 * LLM Bridge — Offline-only compatibility layer.
 * Delegates to the local AI router (skill engine).
 */

import { FinancialContext, ReceiptData } from "../store/types";
import { setLocalProviderContext } from "./ai/providers/localProvider";
import * as aiRouter from "./ai/router";
import { AIGenerationOptions } from "./ai/types";

export interface LLMBridge {
  isAvailable(): boolean;
  generateResponse(prompt: string, options?: AIGenerationOptions): Promise<string>;
  generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: AIGenerationOptions,
  ): Promise<void>;
  setContext(context: FinancialContext, receipt?: ReceiptData): void;
}

class LocalLLMBridge implements LLMBridge {
  isAvailable(): boolean {
    return aiRouter.isAvailable();
  }

  setContext(context: FinancialContext, receipt?: ReceiptData): void {
    setLocalProviderContext(context, receipt);
  }

  async generateResponse(
    prompt: string,
    options?: AIGenerationOptions,
  ): Promise<string> {
    const response = await aiRouter.generateResponse(prompt, options);
    return response.text;
  }

  async generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: AIGenerationOptions,
  ): Promise<void> {
    await aiRouter.generateResponseStream(prompt, onToken, options);
  }
}

export const llmBridge: LLMBridge = new LocalLLMBridge();
