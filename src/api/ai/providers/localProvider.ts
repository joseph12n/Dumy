/**
 * Local Provider — Offline-only skill-based financial assistant.
 *
 * Uses the Smart Financial Engine (skill engine) to generate
 * data-driven, personalized responses. No network needed.
 */

import { FinancialContext, ReceiptData } from "../../../store/types";
import { AI_MODEL_ID } from "../catalog";
import { recognizeText } from "../ocrEngine";
import { parseReceipt } from "../receiptParser";
import { generateSmartResponse } from "../smartFinancialEngine";
import { AIGenerationOptions, AIResponseEnvelope } from "../types";

/* ------------------------------------------------------------------ */
/*  Context holder — set before each generation call from chatStore   */
/* ------------------------------------------------------------------ */

let _financialContext: FinancialContext | null = null;
let _receiptData: ReceiptData | undefined;

/**
 * Inject the current financial context so the provider can use it
 * without an import cycle with chatStore.
 */
export function setLocalProviderContext(
  context: FinancialContext,
  receipt?: ReceiptData,
): void {
  _financialContext = context;
  _receiptData = receipt;
}

/* ------------------------------------------------------------------ */
/*  Response generation                                               */
/* ------------------------------------------------------------------ */

function buildMetadata() {
  return {
    modelId: AI_MODEL_ID,
    createdAt: new Date().toISOString(),
  };
}

function simulateStream(
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

/** Extract the last user message from a Llama-formatted prompt */
function extractUserMessage(prompt: string): string {
  const userMarker = "<|user|>";
  const endMarker = "<|end|>";
  const lastUserIdx = prompt.lastIndexOf(userMarker);
  if (lastUserIdx === -1) return prompt;

  const afterMarker = prompt.slice(lastUserIdx + userMarker.length);
  const endIdx = afterMarker.indexOf(endMarker);
  return (endIdx === -1 ? afterMarker : afterMarker.slice(0, endIdx)).trim();
}

function buildEmptyContext(): FinancialContext {
  return {
    currentMonthSummary: {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      topCategories: [],
    },
    recentTransactions: [],
    budgetAlerts: [],
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export async function generateResponse(
  prompt: string,
  options?: AIGenerationOptions,
): Promise<AIResponseEnvelope> {
  // 1. If an image is attached, run OCR + parse first
  let receipt = _receiptData;
  const imageUri = options?.requestContext?.imageUri;

  if (imageUri && !receipt) {
    const ocrResult = await recognizeText(imageUri);
    if (ocrResult.success && ocrResult.text.length > 0) {
      receipt = parseReceipt(ocrResult.text);
    }
  }

  // 2. Generate response with skill engine
  const userMessage = extractUserMessage(prompt);
  const context = _financialContext ?? buildEmptyContext();

  if (receipt) {
    context.attachedReceipt = receipt;
  }

  const text = generateSmartResponse(userMessage, context, receipt);

  return {
    text,
    metadata: buildMetadata(),
  };
}

export async function generateResponseStream(
  prompt: string,
  onToken: (token: string) => void,
  options?: AIGenerationOptions,
): Promise<void> {
  const response = await generateResponse(prompt, options);
  await simulateStream(response.text, onToken);
}

export function isAvailable(): boolean {
  return true;
}
