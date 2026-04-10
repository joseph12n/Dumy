export type AIRuntimeMode = "hybrid" | "online";

export interface AIRuntimeConfig {
  mode: AIRuntimeMode;
  backendUrl: string;
}

function readEnv(key: string): string {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };

  return runtime.process?.env?.[key]?.trim() ?? "";
}

export function getAIRuntimeConfig(): AIRuntimeConfig {
  const mode =
    readEnv("EXPO_PUBLIC_AI_MODE") === "online" ? "online" : "hybrid";

  return {
    mode,
    backendUrl: readEnv("EXPO_PUBLIC_AI_BACKEND_URL"),
  };
}
