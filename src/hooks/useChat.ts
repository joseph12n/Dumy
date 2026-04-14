/**
 * Custom hooks for chatbot interaction.
 * Wraps chatStore for component consumption.
 * Supports text messages and image attachments.
 */

import { useChatStore } from "../store/chatStore";
import { ChatMessage, ReceiptData } from "../store/types";

/**
 * Primary chat hook — state + actions
 */
export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const isResponding = useChatStore((s) => s.isResponding);
  const error = useChatStore((s) => s.error);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearSession = useChatStore((s) => s.clearSession);
  const currentSessionId = useChatStore((s) => s.currentSessionId);
  const attachReceipt = useChatStore((s) => s.attachReceipt);
  const lastReceipt = useChatStore((s) => s.lastReceipt);

  return {
    messages,
    isResponding,
    error,
    sendMessage,
    clearSession,
    currentSessionId,
    attachReceipt,
    lastReceipt,
  };
}

export function useChatMessages(): ChatMessage[] {
  return useChatStore((s) => s.messages);
}

export function useLastMessage(): ChatMessage | undefined {
  const messages = useChatStore((s) => s.messages);
  return messages[messages.length - 1];
}

export function useChatMessageRange(from: number, to: number): ChatMessage[] {
  const messages = useChatStore((s) => s.messages);
  return messages.slice(from, to);
}

export function useRecentChatMessages(limit: number = 10): ChatMessage[] {
  const messages = useChatStore((s) => s.messages);
  return messages.slice(-limit);
}

export function useChatMessagesByRole(
  role: "user" | "assistant",
): ChatMessage[] {
  const messages = useChatStore((s) => s.messages);
  return messages.filter((m) => m.role === role);
}

export function useChatLoading(): boolean {
  return useChatStore((s) => s.isResponding);
}

export function useChatSessionId(): string {
  return useChatStore((s) => s.currentSessionId);
}

export function useChatError(): string | null {
  return useChatStore((s) => s.error);
}

export function useChatMessageCount(): number {
  const messages = useChatStore((s) => s.messages);
  return messages.length;
}

export function useHasChatMessages(): boolean {
  const messages = useChatStore((s) => s.messages);
  return messages.length > 0;
}

export function useLastReceipt(): ReceiptData | null {
  return useChatStore((s) => s.lastReceipt);
}

export function useChatConversationStats(): {
  userTurns: number;
  assistantTurns: number;
  totalTurns: number;
} {
  const messages = useChatStore((s) => s.messages);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const assistantTurns = messages.filter(
    (m) => m.role === "assistant",
  ).length;

  return {
    userTurns,
    assistantTurns,
    totalTurns: messages.length,
  };
}
