import { create } from "zustand";
import { recognizeText } from "../api/ai/ocrEngine";
import { parseReceipt, summarizeReceipt } from "../api/ai/receiptParser";
import { buildChatContext } from "../api/chatContextBuilder";
import { llmBridge } from "../api/llmBridge";
import { buildFullPrompt, SYSTEM_PROMPT } from "../api/promptTemplates";
import { generateId } from "../utils/uuid";
import { getDatabase } from "./database";
import { chatRepository } from "./repositories/chatRepository";
import { ChatMessage, CreateChatMessageInput, ReceiptData } from "./types";

interface ChatState {
  messages: ChatMessage[];
  currentSessionId: string;
  isResponding: boolean;
  error: string | null;
  /** Last scanned receipt available for analysis */
  lastReceipt: ReceiptData | null;

  // Actions
  initSession: () => void;
  loadSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string, imageUri?: string) => Promise<void>;
  clearSession: () => Promise<void>;
  /** Inject a scanned receipt into the conversation */
  attachReceipt: (receipt: ReceiptData) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentSessionId: "",
  isResponding: false,
  error: null,
  lastReceipt: null,

  initSession: () => {
    const sessionId = generateId();
    set({
      messages: [],
      currentSessionId: sessionId,
      error: null,
      lastReceipt: null,
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

  attachReceipt: (receipt: ReceiptData) => {
    set({ lastReceipt: receipt });
    console.log("[ChatStore] Receipt attached:", receipt.vendor ?? "unknown");
  },

  sendMessage: async (content, imageUri) => {
    const state = get();

    if (!state.currentSessionId) {
      set({ error: "No active session" });
      return;
    }

    try {
      set({ isResponding: true, error: null });

      const db = await getDatabase();

      // 1. If image attached, run OCR + parse
      let receipt = state.lastReceipt ?? undefined;
      let displayContent = content;

      if (imageUri) {
        const ocrResult = await recognizeText(imageUri);
        if (ocrResult.success && ocrResult.text.length > 0) {
          receipt = parseReceipt(ocrResult.text);
          set({ lastReceipt: receipt });
          const summary = summarizeReceipt(receipt);
          displayContent = content
            ? `${content}\n\n[Recibo escaneado]\n${summary}`
            : `[Recibo escaneado]\n${summary}`;
        } else if (ocrResult.error) {
          displayContent = content
            ? `${content}\n\n[No se pudo leer la imagen: ${ocrResult.error}]`
            : `[No se pudo leer la imagen: ${ocrResult.error}]`;
        }
      }

      // 2. Insert user message
      const userMessageInput: CreateChatMessageInput = {
        role: "user",
        content: displayContent,
        sessionId: state.currentSessionId,
      };
      const userMessage = await chatRepository.insertMessage(
        db,
        userMessageInput,
      );
      set((s) => ({ messages: [...s.messages, userMessage] }));

      // 3. Build context from current financial data
      const context = await buildChatContext(5);

      // 4. Build conversation history
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

      // 5. Build full prompt
      const fullPrompt = buildFullPrompt(
        SYSTEM_PROMPT,
        context,
        history,
        displayContent,
      );

      // 6. Inject context into the local provider
      llmBridge.setContext(context, receipt);

      // 7. Get response (offline, skill-based)
      const response = await llmBridge.generateResponse(fullPrompt, {
        maxTokens: 512,
        temperature: 0.9,
        requestContext: {
          source: imageUri ? "scan" : "chat",
          conversationId: state.currentSessionId,
          imageUri,
        },
      });

      // 8. Insert assistant message
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
