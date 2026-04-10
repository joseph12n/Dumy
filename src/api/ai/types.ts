export type AIExecutionMode = "offline" | "online" | "hybrid";

export type AIProviderKind = "local-open-source" | "remote-backend";

export type AIRequestSource = "chat" | "system" | "search" | "summary";

export interface AIRequestContext {
  source: AIRequestSource;
  mode: AIExecutionMode;
  freshDataRequired: boolean;
  allowNetwork: boolean;
  conversationId?: string;
}

export interface AIGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  requestContext?: AIRequestContext;
}

export interface AIResponseMetadata {
  providerId: string;
  modelId: string;
  mode: AIExecutionMode;
  cached: boolean;
  createdAt: string;
}

export interface AIResponseEnvelope {
  text: string;
  metadata: AIResponseMetadata;
}

export interface AIModelProfile {
  id: string;
  name: string;
  providerKind: AIProviderKind;
  mode: AIExecutionMode;
  offlineCapable: boolean;
  onlineCapable: boolean;
  description: string;
  strengths: string[];
}

export interface AIProviderCapabilities {
  offline: boolean;
  online: boolean;
  streaming: boolean;
  freshData: boolean;
}

export interface AIProvider {
  readonly id: string;
  readonly kind: AIProviderKind;
  readonly mode: AIExecutionMode;
  describe(): AIModelProfile;
  isAvailable(): boolean;
  capabilities(): AIProviderCapabilities;
  generateResponse(
    prompt: string,
    options?: AIGenerationOptions,
  ): Promise<AIResponseEnvelope>;
  generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: AIGenerationOptions,
  ): Promise<void>;
}

export interface AISelectionResult {
  providerId: string;
  modelId: string;
  reason: string;
}
