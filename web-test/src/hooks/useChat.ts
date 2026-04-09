import { useChatStore } from '../store/chatStore';

export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const isResponding = useChatStore((s) => s.isResponding);
  const error = useChatStore((s) => s.error);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearSession = useChatStore((s) => s.clearSession);
  return { messages, isResponding, error, sendMessage, clearSession };
}
