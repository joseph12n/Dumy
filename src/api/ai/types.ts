export type AIRequestSource = "chat" | "system" | "scan";

export interface AIRequestContext {
  source: AIRequestSource;
  conversationId?: string;
  /** URI of an image the user attached (receipt photo, gallery image, etc.) */
  imageUri?: string;
}

export interface AIGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  requestContext?: AIRequestContext;
}

export interface AIResponseEnvelope {
  text: string;
  metadata: {
    modelId: string;
    createdAt: string;
  };
}
