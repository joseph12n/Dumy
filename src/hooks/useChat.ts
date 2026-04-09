/**
 * Custom hooks for chatbot interaction
 * Wraps chatStore for component consumption
 */

import { useChatStore } from '../store/chatStore';
import { ChatMessage } from '../store/types';

/**
 * Get chat state and send message function
 */
export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const isResponding = useChatStore((s) => s.isResponding);
  const error = useChatStore((s) => s.error);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearSession = useChatStore((s) => s.clearSession);
  const currentSessionId = useChatStore((s) => s.currentSessionId);

  return {
    messages,
    isResponding,
    error,
    sendMessage,
    clearSession,
    currentSessionId,
  };
}

/**
 * Get chat messages only
 */
export function useChatMessages(): ChatMessage[] {
  return useChatStore((s) => s.messages);
}

/**
 * Get the last message (most recent)
 */
export function useLastMessage(): ChatMessage | undefined {
  const messages = useChatStore((s) => s.messages);
  return messages[messages.length - 1];
}

/**
 * Get messages between two indices
 */
export function useChatMessageRange(from: number, to: number): ChatMessage[] {
  const messages = useChatStore((s) => s.messages);
  return messages.slice(from, to);
}

/**
 * Get N most recent messages
 */
export function useRecentChatMessages(limit: number = 10): ChatMessage[] {
  const messages = useChatStore((s) => s.messages);
  return messages.slice(-limit);
}

/**
 * Get messages from a specific role
 */
export function useChatMessagesByRole(
  role: 'user' | 'assistant',
): ChatMessage[] {
  const messages = useChatStore((s) => s.messages);
  return messages.filter((m) => m.role === role);
}

/**
 * Get chat loading state (while waiting for response)
 */
export function useChatLoading(): boolean {
  return useChatStore((s) => s.isResponding);
}

/**
 * Get current session ID
 */
export function useChatSessionId(): string {
  return useChatStore((s) => s.currentSessionId);
}

/**
 * Get chat error if any
 */
export function useChatError(): string | null {
  return useChatStore((s) => s.error);
}

/**
 * Get message count
 */
export function useChatMessageCount(): number {
  const messages = useChatStore((s) => s.messages);
  return messages.length;
}

/**
 * Check if there are any messages
 */
export function useHasChatMessages(): boolean {
  const messages = useChatStore((s) => s.messages);
  return messages.length > 0;
}

/**
 * Get conversation summary (user turns vs assistant turns)
 */
export function useChatConversationStats(): {
  userTurns: number;
  assistantTurns: number;
  totalTurns: number;
} {
  const messages = useChatStore((s) => s.messages);

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const assistantTurns = messages.filter(
    (m) => m.role === 'assistant',
  ).length;

  return {
    userTurns,
    assistantTurns,
    totalTurns: messages.length,
  };
}
