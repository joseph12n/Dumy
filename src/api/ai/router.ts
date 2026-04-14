/**
 * AI Router — Simplified offline-only router.
 * Delegates everything to the local provider.
 */

import {
  generateResponse as localGenerate,
  generateResponseStream as localStream,
  isAvailable as localIsAvailable,
} from "./providers/localProvider";
import { AIGenerationOptions, AIResponseEnvelope } from "./types";

export function isAvailable(): boolean {
  return localIsAvailable();
}

export async function generateResponse(
  prompt: string,
  options?: AIGenerationOptions,
): Promise<AIResponseEnvelope> {
  return localGenerate(prompt, options);
}

export async function generateResponseStream(
  prompt: string,
  onToken: (token: string) => void,
  options?: AIGenerationOptions,
): Promise<void> {
  await localStream(prompt, onToken, options);
}
