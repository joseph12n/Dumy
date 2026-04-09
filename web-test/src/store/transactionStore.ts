import { create } from 'zustand';
import { CreateTransactionInput, Transaction, UpdateTransactionInput } from './types';
import { loadFromStorage, saveToStorage } from './storage';
import { generateId } from '../utils/uuid';
import { nowISO } from '../utils/dates';

const STORAGE_KEY = 'dumy-transactions';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;

  addTransaction: (input: CreateTransactionInput) => Transaction;
  updateTransaction: (input: UpdateTransactionInput) => void;
  deleteTransaction: (id: string) => void;
}

const saved = loadFromStorage<Transaction[]>(STORAGE_KEY, []);

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: saved,
  isLoading: false,

  addTransaction: (input) => {
    const now = nowISO();
    const tx: Transaction = {
      id: generateId(),
      amount: input.amount,
      description: input.description,
      categoryId: input.categoryId,
      date: input.date,
      type: input.type,
      receiptImagePath: input.receiptImagePath ?? null,
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ transactions: [tx, ...s.transactions] }));
    return tx;
  },

  updateTransaction: (input) => {
    const now = nowISO();
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === input.id
          ? {
              ...t,
              ...(input.amount !== undefined && { amount: input.amount }),
              ...(input.description !== undefined && { description: input.description }),
              ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
              ...(input.date !== undefined && { date: input.date }),
              ...(input.type !== undefined && { type: input.type }),
              ...(input.receiptImagePath !== undefined && { receiptImagePath: input.receiptImagePath }),
              updatedAt: now,
            }
          : t,
      ),
    }));
  },

  deleteTransaction: (id) => {
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },
}));

// Auto-persist
useTransactionStore.subscribe((state) => {
  saveToStorage(STORAGE_KEY, state.transactions);
});
