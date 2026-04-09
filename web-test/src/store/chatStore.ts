import { create } from 'zustand';
import { ChatMessage } from './types';
import { generateId } from '../utils/uuid';
import { nowISO } from '../utils/dates';

const MOCK_RESPONSES = [
  'Basandome en tus gastos de este mes, veo que has gastado mas en Alimentacion que en otras categorias. Te recomendaria revisar tus habitos de compra en mercados y restaurantes.',
  'Tus gastos en transporte estan dentro de lo normal. Sin embargo, si usas mucho TransMilenio o taxi, considera usar bicicleta algunos dias para ahorrar.',
  'Excelente! Veo que este mes ahorraste mas dinero que el anterior. Sigue asi. Tienes algun objetivo de ahorro a largo plazo?',
  'Note que tiendes a gastar mas los fines de semana. Es comun. Te sugiero preparar un presupuesto semanal para tener mejor control.',
  'Tu ratio de ingresos vs gastos es saludable. Mantienes un balance positivo. Quieres que te ayude a establecer un presupuesto para alguna categoria especifica?',
  'He analizado tus transacciones recientes. Parece que estas en una buena posicion financiera. En que puedo ayudarte? Consejos sobre presupuesto, ahorro o inversion?',
];

interface ChatState {
  messages: ChatMessage[];
  currentSessionId: string;
  isResponding: boolean;
  error: string | null;

  initSession: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearSession: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentSessionId: generateId(),
  isResponding: false,
  error: null,

  initSession: () => {
    set({ messages: [], currentSessionId: generateId(), error: null });
  },

  sendMessage: async (content) => {
    const state = get();
    const sessionId = state.currentSessionId;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      createdAt: nowISO(),
      sessionId,
    };

    set((s) => ({ messages: [...s.messages, userMsg], isResponding: true, error: null }));

    // Simulate LLM delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));

    const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: response,
      createdAt: nowISO(),
      sessionId,
    };

    set((s) => ({ messages: [...s.messages, assistantMsg], isResponding: false }));
  },

  clearSession: () => {
    get().initSession();
  },
}));
