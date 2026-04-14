/**
 * OCR Engine - Google ML Kit Text Recognition wrapper.
 *
 * Uses @react-native-ml-kit/text-recognition for on-device text extraction.
 * Gracefully degrades when the native module is not available (Expo Go).
 */

import { OCRResult, OCRTextBlock } from "../../store/types";

let TextRecognitionModule: {
  recognize(uri: string): Promise<{
    text: string;
    blocks: Array<{
      text: string;
      frame?: { x: number; y: number; width: number; height: number };
    }>;
  }>;
} | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("@react-native-ml-kit/text-recognition");
  TextRecognitionModule = mod.default ?? mod;
} catch {
  TextRecognitionModule = null;
}

/**
 * Check whether the OCR native module is loaded and usable.
 */
export function isOCRAvailable(): boolean {
  return TextRecognitionModule !== null;
}

/**
 * Run OCR on an image URI and return structured text blocks.
 */
export async function recognizeText(imageUri: string): Promise<OCRResult> {
  if (!TextRecognitionModule) {
    return {
      success: false,
      text: "",
      blocks: [],
      error:
        "OCR no disponible. Se requiere un build nativo (EAS Build) para usar ML Kit.",
    };
  }

  try {
    const result = await TextRecognitionModule.recognize(imageUri);

    const blocks: OCRTextBlock[] = (result.blocks ?? []).map((b) => ({
      text: b.text,
      confidence: 1,
      boundingBox: b.frame
        ? {
            x: b.frame.x,
            y: b.frame.y,
            width: b.frame.width,
            height: b.frame.height,
          }
        : undefined,
    }));

    return {
      success: true,
      text: result.text ?? "",
      blocks,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido en OCR";
    return {
      success: false,
      text: "",
      blocks: [],
      error: message,
    };
  }
}
