import { create } from "zustand";
import { AIRequestContext } from "../api/ai/types";
import { buildChatContext } from "../api/chatContextBuilder";
import { llmBridge } from "../api/llmBridge";
import { buildFullPrompt, SYSTEM_PROMPT } from "../api/promptTemplates";
import { generateId } from "../utils/uuid";
import { getDatabase } from "./database";
import { chatRepository } from "./repositories/chatRepository";
import { ChatMessage, CreateChatMessageInput } from "./types";

const FRESH_DATA_KEYWORDS = [
  "hoy",
  "actual",
  "actualizado",
  "internet",
  "noticia",
  "noticias",
  "precio",
  "trm",
  "dolar",
  "buscar",
  "google",
  "web",
  "tendencia mundial",
  "mercado hoy",
];

function buildChatRequestContext(
  content: string,
  sessionId: string,
): AIRequestContext {
  const normalized = content.toLowerCase();
  const freshDataRequired = FRESH_DATA_KEYWORDS.some((keyword) =>
    normalized.includes(keyword),
  );

  return {
    source: "chat",
    mode: freshDataRequired ? "online" : "hybrid",
    freshDataRequired,
    allowNetwork: true,
    conversationId: sessionId,
  };
}

interface ChatState {
  messages: ChatMessage[];
  currentSessionId: string;
  isResponding: boolean;
  error: string | null;

  // Actions
  initSession: () => void;
  loadSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentSessionId: "",
  isResponding: false,
  error: null,

  initSession: () => {
    const sessionId = generateId();
    set({
      messages: [],
      currentSessionId: sessionId,
      error: null,
    });
    console.log("[ChatStore] Session initialized:", sessionId);
  },

  loadSession: async (sessionId) => {
    try {
      const db = await getDatabase();
      const messages = await chatRepository.getSession(db, sessionId);
      set({
        messages,
        currentSessionId: sessionId,
        error: null,
      });
      console.log(
        "[ChatStore] Session loaded:",
        sessionId,
        messages.length,
        "messages",
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage });
      console.error("[ChatStore] Error loading session:", error);
    }
  },

  sendMessage: async (content) => {
    const state = get();

    if (!state.currentSessionId) {
      set({ error: "No active session" });
      return;
    }

    try {
      set({ isResponding: true, error: null });

      const db = await getDatabase();

      // 1. Insert user message
      const userMessageInput: CreateChatMessageInput = {
        role: "user",
        content,
        sessionId: state.currentSessionId,
      };
      const userMessage = await chatRepository.insertMessage(
        db,
        userMessageInput,
      );
      set((s) => ({ messages: [...s.messages, userMessage] }));
      console.log("[ChatStore] User message added");

      // 2. Build context from current financial data
      const context = await buildChatContext(5);

      // 3. Build conversation history for the model (exclude current user message)
      const history = state.messages
        .filter((m) => m.sessionId === state.currentSessionId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .slice(-10)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // 4. Build full prompt for LLM
      const fullPrompt = buildFullPrompt(
        SYSTEM_PROMPT,
        context,
        history,
        content,
      );

      // 5. Get response from LLM
      const requestContext = buildChatRequestContext(
        content,
        state.currentSessionId,
      );

      const response = await llmBridge.generateResponse(fullPrompt, {
        maxTokens: 512,
        temperature: 0.9,
        requestContext,
      });

      // 6. Insert assistant message
      const assistantMessageInput: CreateChatMessageInput = {
        role: "assistant",
        content: response,
        sessionId: state.currentSessionId,
      };
      const assistantMessage = await chatRepository.insertMessage(
        db,
        assistantMessageInput,
      );
      set((s) => ({ messages: [...s.messages, assistantMessage] }));
      console.log("[ChatStore] Assistant message added");

      set({ isResponding: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, isResponding: false });
      console.error("[ChatStore] Error sending message:", error);
    }
  },

  clearSession: async () => {
    const state = get();

    if (!state.currentSessionId) {
      return;
    }

    try {
      const db = await getDatabase();
      await chatRepository.deleteSession(db, state.currentSessionId);
      get().initSession();
      console.log("[ChatStore] Session cleared");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage });
      console.error("[ChatStore] Error clearing session:", error);
    }
  },
}));
