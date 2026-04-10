import { AIModelProfile } from "./types";

export const AI_MODEL_CATALOG = {
  local: [
    {
      id: "local-qwen2.5-7b-instruct",
      name: "Qwen2.5 7B Instruct",
      providerKind: "local-open-source",
      mode: "offline",
      offlineCapable: true,
      onlineCapable: false,
      description:
        "Modelo local principal para respuestas offline y tareas generales.",
      strengths: [
        "Español",
        "Razonamiento general",
        "Privacidad",
        "Costo cero por consulta",
      ],
    },
    {
      id: "local-llama-3.1-8b-instruct",
      name: "Llama 3.1 8B Instruct",
      providerKind: "local-open-source",
      mode: "offline",
      offlineCapable: true,
      onlineCapable: false,
      description:
        "Alternativa local sólida para dispositivos con más memoria.",
      strengths: ["Razonamiento", "Contexto largo", "Estabilidad", "Español"],
    },
  ],
  online: [
    {
      id: "remote-rag-gateway",
      name: "Hybrid RAG Gateway",
      providerKind: "remote-backend",
      mode: "online",
      offlineCapable: false,
      onlineCapable: true,
      description:
        "Puente remoto para búsquedas web, datos frescos y respuestas con contexto de internet.",
      strengths: [
        "Información actualizada",
        "Web search",
        "RAG",
        "Fallback remoto",
      ],
    },
  ],
} as const satisfies {
  local: AIModelProfile[];
  online: AIModelProfile[];
};

export const DEFAULT_LOCAL_MODEL_ID = AI_MODEL_CATALOG.local[0].id;

export const DEFAULT_ONLINE_MODEL_ID = AI_MODEL_CATALOG.online[0].id;
